import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BottomNav from '../../layout/BottomNav';
import HeaderNavRecipeRecommendation from '../../layout/HeaderNavRecipeRecommendation';
import '../../styles/recipe_result.css';
// 로컬 더미 이미지로 교체 (외부 placeholder 차단/오류 대비)
// import img1 from '../../assets/test/test1.png';
// import img2 from '../../assets/test/test2.png';
// import img3 from '../../assets/test/test3.png';
import fallbackImg from '../../assets/no_items.png';
import bookmarkIcon from '../../assets/bookmark-icon.png';
import { recipeApi } from '../../api/recipeApi';

const RecipeResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 상태 관리
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allPossibleRecipes, setAllPossibleRecipes] = useState([]); // 모든 가능한 레시피 조합
  const [remainingStock, setRemainingStock] = useState(new Map()); // 남은 재고 상태
  const [isInitialized, setIsInitialized] = useState(false); // 초기화 상태 추가
  // searchMethod는 더 이상 사용하지 않음 (차감 형식 API 사용)

  // 백엔드 응답의 이미지 키 다양성 대응 및 로컬 폴백 사용
  // const localImgs = useMemo(() => [img1, img2, img3], []);
  const getRecipeImageSrc = (recipe, idx) => {
    const candidates = [
      recipe?.thumbnail_url,
      recipe?.thumbnailUrl,
      recipe?.image_url,
      recipe?.img_url,
      recipe?.main_image_url,
      recipe?.image,
      recipe?.thumbnail,
    ].filter((v) => typeof v === 'string' && v.length > 0);
    if (candidates.length > 0) return candidates[0];
    return fallbackImg;
  };

  // 재료 표기를 문자열로 정규화 (객체/문자열 둘 다 처리)
  const displayIngredients = useMemo(() => {
    if (!Array.isArray(ingredients)) return [];
    return ingredients.map((ing) => {
      if (typeof ing === 'string') return ing;
      const name = ing?.name ?? '';
      const amount = ing?.amount;
      const unit = ing?.unit;
      const amountPart = amount != null && amount !== '' ? ` ${amount}` : '';
      const unitPart = unit ? `${unit}` : '';
      return `${name}${amountPart}${unitPart}`.trim();
    });
  }, [ingredients]);


     // 재고 소진용 레시피 추천 (Python 로직과 유사하게 구현)
       const searchRecipes = useCallback(async (page = 1) => {
      try {
        console.log('🔍 searchRecipes 함수 시작');
        console.log('🔍 현재 ingredients 상태:', ingredients);
        setLoading(true);
        setError('');
        
        if (!ingredients || ingredients.length === 0) {
          console.log('❌ ingredients가 비어있음');
          setError('검색할 재료를 입력해주세요.');
          setLoading(false);
          return;
        }

       // 재료 정보 정규화
       const normalizedIngredients = ingredients.map(ing => {
         if (typeof ing === 'string') {
           return { name: ing.trim(), amount: 0, unit: 'g' };
         }
         return {
           name: ing?.name?.trim() || '',
           amount: Number(ing?.amount) || 0,
           unit: ing?.unit?.trim() || 'g'
         };
       }).filter(ing => ing.name && ing.amount > 0);

       if (normalizedIngredients.length === 0) {
         setError('유효한 재료를 입력해주세요.');
         setLoading(false);
         return;
       }

       console.log('재고 소진 레시피 추천 시작:', normalizedIngredients);
       
       // 1단계: 모든 재료로 검색하여 레시피 후보 수집
       const allRecipes = new Map(); // recipe_id를 키로 사용
       
       for (const ingredient of normalizedIngredients) {
         try {
           const response = await recipeApi.searchRecipes({
             recipe: ingredient.name,
             method: 'ingredient',
             page: 1,
             size: 20 // 더 많은 레시피 수집
           });
           
           if (response?.recipes && Array.isArray(response.recipes)) {
             response.recipes.forEach(recipe => {
               const recipeId = recipe.RECIPE_ID || recipe.recipe_id;
               if (recipeId && !allRecipes.has(recipeId)) {
                 allRecipes.set(recipeId, {
                   ...recipe,
                   materials: [], // 재료 정보는 나중에 채움
                   score: 0 // 점수는 나중에 계산
                 });
               }
             });
           }
         } catch (err) {
           console.warn(`${ingredient.name} 검색 실패:`, err);
         }
       }

       console.log('수집된 레시피 후보:', allRecipes.size, '개');
       
       // 2단계: 각 레시피의 재료 정보 수집 (상세 정보 API 사용)
       const recipesWithMaterials = [];
       for (const [recipeId, recipe] of allRecipes) {
         try {
           const detailResponse = await recipeApi.getRecipeDetail(recipeId);
           if (detailResponse?.materials && Array.isArray(detailResponse.materials)) {
             const materials = detailResponse.materials.map(material => ({
               name: material.material_name,
               amount: parseFloat(material.measure_amount?.replace(/[^\d.]/g, '')) || 0,
               unit: material.measure_unit || 'g'
             }));
             
             recipesWithMaterials.push({
               ...recipe,
               materials,
               score: 0
             });
           }
         } catch (err) {
           console.warn(`레시피 ${recipeId} 상세 정보 조회 실패:`, err);
         }
       }

       console.log('재료 정보가 있는 레시피:', recipesWithMaterials.length, '개');
       
       // 3단계: Python 로직과 유사한 순차적 레시피 선택
       const recommended = [];
       const remainingStock = new Map();
       normalizedIngredients.forEach(ing => {
         remainingStock.set(ing.name, { amount: ing.amount, unit: ing.unit });
       });

       // 레시피 점수 계산 및 정렬
       const scoredRecipes = recipesWithMaterials.map(recipe => {
         let score = 0;
         let usedIngredients = {};
         
         recipe.materials.forEach(material => {
           const stock = remainingStock.get(material.name);
           if (stock && stock.amount > 0.001) { // 1g 미만은 무시
             const unitMatch = !stock.unit || !material.unit || 
                              stock.unit.toLowerCase() === material.unit.toLowerCase();
             
             if (unitMatch) {
               const usableAmount = Math.min(material.amount, stock.amount);
               if (usableAmount > 0.001) {
                 score += usableAmount; // 사용 가능한 재료량만큼 점수 추가
                 usedIngredients[material.name] = {
                   amount: usableAmount,
                   unit: material.unit
                 };
               }
             }
           }
         });
         
         return {
           ...recipe,
           score,
           usedIngredients,
           usedIngredientCount: Object.keys(usedIngredients).length
         };
       }).filter(recipe => recipe.score > 0)
         .sort((a, b) => {
           // 1순위: 사용하는 재료 개수, 2순위: 점수
           if (a.usedIngredientCount !== b.usedIngredientCount) {
             return b.usedIngredientCount - a.usedIngredientCount;
           }
           return b.score - a.score;
         });

       console.log('점수 계산된 레시피:', scoredRecipes.length, '개');
       
               // 4단계: 모든 가능한 레시피 조합 생성 (같은 페이지에 여러 조합 표시)
        const allPossibleCombinations = [];
        const tempStock = new Map(remainingStock);
        
        // 더 효과적인 조합 찾기 - 각 레시피를 개별적으로 시도
        const findCombinations = () => {
          // 1. 단일 레시피만 사용하는 경우들
          for (const recipe of scoredRecipes) {
            const testStock = new Map(tempStock);
            let canUse = true;
            
            // 임시로 재고 차감 시도
            for (const [materialName, usage] of Object.entries(recipe.usedIngredients)) {
              const stock = testStock.get(materialName);
              if (!stock || stock.amount < usage.amount) {
                canUse = false;
                break;
              }
            }
            
            if (canUse) {
              // 재고 차감
              for (const [materialName, usage] of Object.entries(recipe.usedIngredients)) {
                const stock = testStock.get(materialName);
                stock.amount -= usage.amount;
              }
              
              allPossibleCombinations.push({
                recipes: [recipe],
                remainingStock: new Map(testStock),
                totalUsedIngredients: Object.keys(recipe.usedIngredients).length,
                totalScore: recipe.score,
                combinationType: '단일 레시피'
              });
            }
          }
          
          // 2. 두 개 레시피 조합 찾기
          for (let i = 0; i < scoredRecipes.length; i++) {
            for (let j = i + 1; j < scoredRecipes.length; j++) {
              const recipe1 = scoredRecipes[i];
              const recipe2 = scoredRecipes[j];
              const testStock = new Map(tempStock);
              let canUse = true;
              
              // 두 레시피 모두 사용 가능한지 확인
              const allMaterials = [...Object.entries(recipe1.usedIngredients), ...Object.entries(recipe2.usedIngredients)];
              for (const [materialName, usage] of allMaterials) {
                const stock = testStock.get(materialName);
                if (!stock || stock.amount < usage.amount) {
                  canUse = false;
                  break;
                }
              }
              
              if (canUse) {
                // 재고 차감
                for (const [materialName, usage] of allMaterials) {
                  const stock = testStock.get(materialName);
                  stock.amount -= usage.amount;
                }
                
                allPossibleCombinations.push({
                  recipes: [recipe1, recipe2],
                  remainingStock: new Map(testStock),
                  totalUsedIngredients: Object.keys(recipe1.usedIngredients).length + Object.keys(recipe2.usedIngredients).length,
                  totalScore: recipe1.score + recipe2.score,
                  combinationType: '두 레시피 조합'
                });
              }
            }
          }
          
          // 3. 세 개 레시피 조합 찾기 (재료가 충분한 경우)
          if (scoredRecipes.length >= 3) {
            for (let i = 0; i < scoredRecipes.length - 2; i++) {
              for (let j = i + 1; j < scoredRecipes.length - 1; j++) {
                for (let k = j + 1; k < scoredRecipes.length; k++) {
                  const recipe1 = scoredRecipes[i];
                  const recipe2 = scoredRecipes[j];
                  const recipe3 = scoredRecipes[k];
                  const testStock = new Map(tempStock);
                  let canUse = true;
                  
                  // 세 레시피 모두 사용 가능한지 확인
                  const allMaterials = [
                    ...Object.entries(recipe1.usedIngredients), 
                    ...Object.entries(recipe2.usedIngredients),
                    ...Object.entries(recipe3.usedIngredients)
                  ];
                  
                  for (const [materialName, usage] of allMaterials) {
                    const stock = testStock.get(materialName);
                    if (!stock || stock.amount < usage.amount) {
                      canUse = false;
                      break;
                    }
                  }
                  
                  if (canUse) {
                    // 재고 차감
                    for (const [materialName, usage] of allMaterials) {
                      const stock = testStock.get(materialName);
                      stock.amount -= usage.amount;
                    }
                    
                    allPossibleCombinations.push({
                      recipes: [recipe1, recipe2, recipe3],
                      remainingStock: new Map(testStock),
                      totalUsedIngredients: Object.keys(recipe1.usedIngredients).length + 
                                         Object.keys(recipe2.usedIngredients).length + 
                                         Object.keys(recipe3.usedIngredients).length,
                      totalScore: recipe1.score + recipe2.score + recipe3.score,
                      combinationType: '세 레시피 조합'
                    });
                  }
                }
              }
            }
          }
        };
        
        findCombinations();
        
        // 조합을 점수순으로 정렬
        allPossibleCombinations.sort((a, b) => {
          if (a.totalUsedIngredients !== b.totalUsedIngredients) {
            return b.totalUsedIngredients - a.totalUsedIngredients;
          }
          return b.totalScore - a.totalScore;
        });
        
        console.log('가능한 모든 조합:', allPossibleCombinations.length, '개');
        
        // 모든 조합을 하나의 배열로 합치기 (같은 페이지에 표시)
        if (allPossibleCombinations.length > 0) {
          const allRecipes = [];
          allPossibleCombinations.forEach((combination, index) => {
            combination.recipes.forEach(recipe => {
              allRecipes.push({
                ...recipe,
                combinationIndex: index + 1,
                combinationType: combination.combinationType,
                remainingStock: combination.remainingStock
              });
            });
          });
          
          console.log('설정된 조합 수:', allPossibleCombinations.length);
          console.log('전체 레시피 수:', allRecipes.length);
          
          setRecipes(allRecipes);
          setTotal(allPossibleCombinations.length);
          setCurrentPage(1);
          setAllPossibleRecipes(allPossibleCombinations);
          setRemainingStock(new Map(remainingStock));
                } else {
          console.log('❌ 추천 가능한 레시피가 없음');
          setRecipes([]);
          setTotal(0);
          setError('추천 가능한 레시피가 없습니다.');
        }
       
        console.log('✅ searchRecipes 함수 완료');
      } catch (err) {
        console.error('❌ 재고 소진 레시피 추천 실패:', err);
        setError('레시피 추천에 실패했습니다. 잠시 후 다시 시도해주세요.');
        setRecipes([]);
        setTotal(0);
      } finally {
        console.log('🔄 loading 상태를 false로 설정');
        setLoading(false);
      }
        }, [ingredients]);

  // 재료 정보를 직접 받아서 조합 생성하는 함수
  const searchRecipesWithIngredients = useCallback(async (ingredientsToUse) => {
    try {
      console.log('🔍 searchRecipesWithIngredients 함수 시작');
      console.log('🔍 전달받은 재료:', ingredientsToUse);
      setLoading(true);
      setError('');
      
      if (!ingredientsToUse || ingredientsToUse.length === 0) {
        console.log('❌ 전달받은 재료가 비어있음');
        setError('검색할 재료를 입력해주세요.');
        setLoading(false);
        return;
      }

      // 재료 정보 정규화
      const normalizedIngredients = ingredientsToUse.map(ing => {
        if (typeof ing === 'string') {
          return { name: ing.trim(), amount: 0, unit: 'g' };
        }
        return {
          name: ing?.name?.trim() || '',
          amount: Number(ing?.amount) || 0,
          unit: ing?.unit?.trim() || 'g'
        };
      }).filter(ing => ing.name && ing.amount > 0);

      if (normalizedIngredients.length === 0) {
        setError('유효한 재료를 입력해주세요.');
        setLoading(false);
        return;
      }

      console.log('재고 소진 레시피 추천 시작:', normalizedIngredients);
      
      // 1단계: 모든 재료로 검색하여 레시피 후보 수집
      const allRecipes = new Map(); // recipe_id를 키로 사용
      
      for (const ingredient of normalizedIngredients) {
        try {
          const response = await recipeApi.searchRecipes({
            recipe: ingredient.name,
            method: 'ingredient',
            page: 1,
            size: 20 // 더 많은 레시피 수집
          });
          
          if (response?.recipes && Array.isArray(response.recipes)) {
            response.recipes.forEach(recipe => {
              const recipeId = recipe.RECIPE_ID || recipe.recipe_id;
              if (recipeId && !allRecipes.has(recipeId)) {
                allRecipes.set(recipeId, {
                  ...recipe,
                  materials: [], // 재료 정보는 나중에 채움
                  score: 0 // 점수는 나중에 계산
                });
              }
            });
          }
        } catch (err) {
          console.warn(`${ingredient.name} 검색 실패:`, err);
        }
      }

      console.log('수집된 레시피 후보:', allRecipes.size, '개');
      
      // 2단계: 각 레시피의 재료 정보 수집 (상세 정보 API 사용)
      const recipesWithMaterials = [];
      for (const [recipeId, recipe] of allRecipes) {
        try {
          const detailResponse = await recipeApi.getRecipeDetail(recipeId);
          if (detailResponse?.materials && Array.isArray(detailResponse.materials)) {
            const materials = detailResponse.materials.map(material => ({
              name: material.material_name,
              amount: parseFloat(material.measure_amount?.replace(/[^\d.]/g, '')) || 0,
              unit: material.measure_unit || 'g'
            }));
            
            recipesWithMaterials.push({
              ...recipe,
              materials,
              score: 0
            });
          }
        } catch (err) {
          console.warn(`레시피 ${recipeId} 상세 정보 조회 실패:`, err);
        }
      }

      console.log('재료 정보가 있는 레시피:', recipesWithMaterials.length, '개');
      
      // 3단계: Python 로직과 유사한 순차적 레시피 선택
      const recommended = [];
      const remainingStock = new Map();
      normalizedIngredients.forEach(ing => {
        remainingStock.set(ing.name, { amount: ing.amount, unit: ing.unit });
      });

      // 레시피 점수 계산 및 정렬
      const scoredRecipes = recipesWithMaterials.map(recipe => {
        let score = 0;
        let usedIngredients = {};
        
        recipe.materials.forEach(material => {
          const stock = remainingStock.get(material.name);
          if (stock && stock.amount > 0.001) { // 1g 미만은 무시
            const unitMatch = !stock.unit || !material.unit || 
                             stock.unit.toLowerCase() === material.unit.toLowerCase();
            
            if (unitMatch) {
              const usableAmount = Math.min(material.amount, stock.amount);
              if (usableAmount > 0.001) {
                score += usableAmount; // 사용 가능한 재료량만큼 점수 추가
                usedIngredients[material.name] = {
                  amount: usableAmount,
                  unit: material.unit
                };
              }
            }
          }
        });
        
        return {
          ...recipe,
          score,
          usedIngredients,
          usedIngredientCount: Object.keys(usedIngredients).length
        };
      }).filter(recipe => recipe.score > 0)
        .sort((a, b) => {
          // 1순위: 사용하는 재료 개수, 2순위: 점수
          if (a.usedIngredientCount !== b.usedIngredientCount) {
            return b.usedIngredientCount - a.usedIngredientCount;
          }
          return b.score - a.score;
        });

      console.log('점수 계산된 레시피:', scoredRecipes.length, '개');
      
      // 4단계: 모든 가능한 레시피 조합 생성 (같은 페이지에 여러 조합 표시)
      const allPossibleCombinations = [];
      const tempStock = new Map(remainingStock);
      
      // 더 효과적인 조합 찾기 - 각 레시피를 개별적으로 시도
      const findCombinations = () => {
        // 1. 단일 레시피만 사용하는 경우들
        for (const recipe of scoredRecipes) {
          const testStock = new Map(tempStock);
          let canUse = true;
          
          // 임시로 재고 차감 시도
          for (const [materialName, usage] of Object.entries(recipe.usedIngredients)) {
            const stock = testStock.get(materialName);
            if (!stock || stock.amount < usage.amount) {
              canUse = false;
              break;
            }
          }
          
          if (canUse) {
            // 재고 차감
            for (const [materialName, usage] of Object.entries(recipe.usedIngredients)) {
              const stock = testStock.get(materialName);
              stock.amount -= usage.amount;
            }
            
            allPossibleCombinations.push({
              recipes: [recipe],
              remainingStock: new Map(testStock),
              totalUsedIngredients: Object.keys(recipe.usedIngredients).length,
              totalScore: recipe.score,
              combinationType: '단일 레시피'
            });
          }
        }
        
        // 2. 두 개 레시피 조합 찾기
        for (let i = 0; i < scoredRecipes.length; i++) {
          for (let j = i + 1; j < scoredRecipes.length; j++) {
            const recipe1 = scoredRecipes[i];
            const recipe2 = scoredRecipes[j];
            const testStock = new Map(tempStock);
            let canUse = true;
            
            // 두 레시피 모두 사용 가능한지 확인
            const allMaterials = [...Object.entries(recipe1.usedIngredients), ...Object.entries(recipe2.usedIngredients)];
            for (const [materialName, usage] of allMaterials) {
              const stock = testStock.get(materialName);
              if (!stock || stock.amount < usage.amount) {
                canUse = false;
                break;
              }
            }
            
            if (canUse) {
              // 재고 차감
              for (const [materialName, usage] of allMaterials) {
                const stock = testStock.get(materialName);
                stock.amount -= usage.amount;
              }
              
              allPossibleCombinations.push({
                recipes: [recipe1, recipe2],
                remainingStock: new Map(testStock),
                totalUsedIngredients: Object.keys(recipe1.usedIngredients).length + Object.keys(recipe2.usedIngredients).length,
                totalScore: recipe1.score + recipe2.score,
                combinationType: '두 레시피 조합'
              });
            }
          }
        }
        
        // 3. 세 개 레시피 조합 찾기 (재료가 충분한 경우)
        if (scoredRecipes.length >= 3) {
          for (let i = 0; i < scoredRecipes.length - 2; i++) {
            for (let j = i + 1; j < scoredRecipes.length - 1; j++) {
              for (let k = j + 1; k < scoredRecipes.length; k++) {
                const recipe1 = scoredRecipes[i];
                const recipe2 = scoredRecipes[j];
                const recipe3 = scoredRecipes[k];
                const testStock = new Map(tempStock);
                let canUse = true;
                
                // 세 레시피 모두 사용 가능한지 확인
                const allMaterials = [
                  ...Object.entries(recipe1.usedIngredients), 
                  ...Object.entries(recipe2.usedIngredients),
                  ...Object.entries(recipe3.usedIngredients)
                ];
                
                for (const [materialName, usage] of allMaterials) {
                  const stock = testStock.get(materialName);
                  if (!stock || stock.amount < usage.amount) {
                    canUse = false;
                    break;
                  }
                }
                
                if (canUse) {
                  // 재고 차감
                  for (const [materialName, usage] of allMaterials) {
                    const stock = testStock.get(materialName);
                    stock.amount -= usage.amount;
                  }
                  
                  allPossibleCombinations.push({
                    recipes: [recipe1, recipe2, recipe3],
                    remainingStock: new Map(testStock),
                    totalUsedIngredients: Object.keys(recipe1.usedIngredients).length + 
                                       Object.keys(recipe2.usedIngredients).length + 
                                       Object.keys(recipe3.usedIngredients).length,
                    totalScore: recipe1.score + recipe2.score + recipe3.score,
                    combinationType: '세 레시피 조합'
                  });
                }
              }
            }
          }
        }
      };
      
      findCombinations();
      
      // 조합을 점수순으로 정렬
      allPossibleCombinations.sort((a, b) => {
        if (a.totalUsedIngredients !== b.totalUsedIngredients) {
          return b.totalUsedIngredients - a.totalUsedIngredients;
        }
        return b.totalScore - a.totalScore;
      });
      
      console.log('가능한 모든 조합:', allPossibleCombinations.length, '개');
      
      // 모든 조합을 하나의 배열로 합치기 (같은 페이지에 표시)
      if (allPossibleCombinations.length > 0) {
        const allRecipes = [];
        allPossibleCombinations.forEach((combination, index) => {
          combination.recipes.forEach(recipe => {
            allRecipes.push({
              ...recipe,
              combinationIndex: index + 1,
              combinationType: combination.combinationType,
              remainingStock: combination.remainingStock
            });
          });
        });
        
        console.log('설정된 조합 수:', allPossibleCombinations.length);
        console.log('전체 레시피 수:', allRecipes.length);
        
        setRecipes(allRecipes);
        setTotal(allPossibleCombinations.length);
        setCurrentPage(1);
        setAllPossibleRecipes(allPossibleCombinations);
        setRemainingStock(new Map(remainingStock));
      } else {
        console.log('❌ 추천 가능한 레시피가 없음');
        setRecipes([]);
        setTotal(0);
        setError('추천 가능한 레시피가 없습니다.');
      }
     
      console.log('✅ searchRecipesWithIngredients 함수 완료');
    } catch (err) {
      console.error('❌ 재고 소진 레시피 추천 실패:', err);
      setError('레시피 추천에 실패했습니다. 잠시 후 다시 시도해주세요.');
      setRecipes([]);
      setTotal(0);
    } finally {
      console.log('🔄 loading 상태를 false로 설정');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 이미 초기화되었으면 중복 실행 방지
    if (isInitialized) {
      return;
    }
    
    if (location.state) {
      console.log('Location state received:', location.state);
      
      // 이미 받은 레시피 데이터가 있으면 그대로 사용
      if (location.state.recipes && location.state.recipes.length > 0) {
        console.log('이미 받은 레시피 데이터 사용:', location.state.recipes.length, '개');
        
        // ingredients 상태도 설정
        const newIngredients = location.state.ingredients || [];
        setIngredients(newIngredients);
        
        // 재료 정보가 있으면 조합 생성 로직 실행
        if (newIngredients.length > 0) {
          console.log('재료 정보로 조합 생성 시작');
          console.log('재료 정보:', newIngredients);
          // searchRecipes 함수를 직접 호출하여 모든 가능한 조합 생성
          // ingredients 상태가 업데이트되기 전이므로 직접 전달
          searchRecipesWithIngredients(newIngredients);
        } else {
          // 재료 정보가 없으면 받은 레시피만 표시
          const recipesWithCombinations = location.state.recipes.map((recipe, index) => ({
            ...recipe,
            combinationIndex: 1,
            combinationType: '단일 레시피',
            remainingStock: new Map()
          }));
          
          setRecipes(recipesWithCombinations);
          setTotal(location.state.total || recipesWithCombinations.length);
          setCurrentPage(1);
          setAllPossibleRecipes([{
            recipes: location.state.recipes,
            remainingStock: new Map(),
            totalUsedIngredients: 0,
            totalScore: 0,
            combinationType: '단일 레시피'
          }]);
          setLoading(false);
          setIsInitialized(true);
        }
      } else {
        // 레시피 데이터가 없으면 재료로 검색
        const newIngredients = location.state.ingredients || [];
        setIngredients(newIngredients);
        
        if (newIngredients.length > 0) {
          searchRecipes(1);
        } else {
          setLoading(false);
        }
        setIsInitialized(true); // 초기화 완료 표시
      }
    } else {
      // state가 없으면 이전 페이지로 이동
      navigate('/recipes');
    }
  }, [location.state, isInitialized]); // isInitialized 의존성 추가

  // ingredients useEffect 제거 - 중복 실행 방지

  const handleBack = () => {
    navigate('/recipes');
  };

  const handleRecipeClick = (recipe) => {
    console.log('레시피 클릭:', recipe);
    // 레시피 상세 페이지로 이동
    const recipeId = recipe.RECIPE_ID || recipe.recipe_id || recipe.id;
    if (recipeId) {
      // 재료 상태 정보를 state로 전달
      navigate(`/recipes/${recipeId}`, {
        state: {
          ingredients: ingredients,
          recipeData: recipe
        }
      });
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    console.log('다음 페이지 로드:', nextPage);
    console.log('전체 조합 수:', allPossibleRecipes.length);
    
    if (nextPage <= allPossibleRecipes.length) {
      const nextPageRecipes = allPossibleRecipes[nextPage - 1].recipes;
      console.log('다음 페이지 레시피:', nextPageRecipes);
      setRecipes(nextPageRecipes);
      setCurrentPage(nextPage);
      
      // 남은 재고 정보도 업데이트
      setRemainingStock(allPossibleRecipes[nextPage - 1].remainingStock);
    } else {
      console.log('더 이상 페이지가 없습니다.');
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      console.log('이전 페이지 로드:', prevPage);
      
      const prevPageRecipes = allPossibleRecipes[prevPage - 1].recipes;
      console.log('이전 페이지 레시피:', prevPageRecipes);
      setRecipes(prevPageRecipes);
      setCurrentPage(prevPage);
      
      // 남은 재고 정보도 업데이트
      setRemainingStock(allPossibleRecipes[prevPage - 1].remainingStock);
    }
  };

  const handlePageClick = (pageNumber) => {
    console.log('페이지 클릭:', pageNumber);
    
    if (pageNumber >= 1 && pageNumber <= allPossibleRecipes.length) {
      const pageRecipes = allPossibleRecipes[pageNumber - 1].recipes;
      console.log('선택된 페이지 레시피:', pageRecipes);
      setRecipes(pageRecipes);
      setCurrentPage(pageNumber);
      
      // 남은 재고 정보도 업데이트
      setRemainingStock(allPossibleRecipes[pageNumber - 1].remainingStock);
    }
  };

  if (loading) {
    return (
      <div className="recipe-result-page">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="recipe-result-page">
      {/* 헤더 */}
      <HeaderNavRecipeRecommendation onBackClick={handleBack} />

             {/* 선택된 재료 태그들 */}
       <div className="selected-ingredients-section">
         <div className="ingredients-tags">
           {displayIngredients.map((ingredient, index) => (
             <div key={index} className="ingredient-tag">
               <span className="ingredient-name">{ingredient}</span>
             </div>
           ))}
         </div>
         
         {/* 남은 재료 정보 표시
         {remainingStock.size > 0 && (
           <div className="remaining-ingredients">
             <h4>남은 재료:</h4>
             <div className="remaining-tags">
               {Array.from(remainingStock.entries()).map(([name, stock]) => (
                 stock.amount > 0.001 && (
                   <div key={name} className="remaining-tag">
                     <span className="ingredient-name">{name}</span>
                     <span className="amount">{stock.amount.toFixed(1)}{stock.unit}</span>
                   </div>
                 )
               ))}
             </div>
           </div>
         )} */}
       </div>



      {/* 레시피 목록 */}
      <main className="recipe-list">
        {loading && (
          <div className="recipe-card">
            <div className="recipe-info"><h3>불러오는 중...</h3></div>
          </div>
        )}
        {!loading && error && (
          <div className="recipe-card">
            <div className="recipe-info"><h3>{error}</h3></div>
          </div>
        )}
                          {!loading && !error && recipes.length > 0 && (
           <>
             {recipes.map((recipe, idx) => {
               console.log('레시피 렌더링:', recipe);
               return (
                 <div key={recipe.RECIPE_ID || recipe.recipe_id || idx} className="recipe-card" onClick={() => handleRecipeClick(recipe)}>
                   {/* Python 코드와 유사한 레이아웃 */}
                   <div className="recipe-header">
                     <h3 className="recipe-name">[{idx + 1}] {recipe.RECIPE_TITLE || recipe.recipe_title}</h3>
                     {recipe.combinationType && (
                       <span className="combination-type">{recipe.combinationType} #{recipe.combinationIndex}</span>
                     )}
                   </div>
                   
                   <div className="recipe-content">
                     <div className="recipe-image">
                       <img 
                         src={recipe.THUMBNAIL_URL || recipe.thumbnail_url || fallbackImg} 
                         alt={recipe.RECIPE_TITLE || recipe.recipe_title || '레시피'} 
                         onError={(e)=>{ e.currentTarget.src = fallbackImg; }} 
                       />
                     </div>
                     
                     <div className="recipe-info">
                       <p className="recipe-description">
                         <strong>소개:</strong> {recipe.COOKING_INTRODUCTION || recipe.cooking_introduction || ''}
                       </p>
                       
                       {/* 사용된 재료 정보 (Python 코드와 동일) */}
                       {recipe.usedIngredients && Object.keys(recipe.usedIngredients).length > 0 && (
                         <div className="used-ingredients">
                           <p><strong>사용된 재료:</strong></p>
                           <ul>
                             {Object.entries(recipe.usedIngredients).map(([ingName, details]) => (
                               <li key={ingName}>
                                 <strong>{ingName}</strong>: {details.amount.toFixed(1)}{details.unit}
                               </li>
                             ))}
                           </ul>
                         </div>
                       )}
                       
                       {/* 레시피 통계 정보 */}
                       <div className="recipe-stats">
                         <span className="serving serving-small">{recipe.NUMBER_OF_SERVING || recipe.number_of_serving}</span>
                         <span className="separator"> | </span>
                         <span className="scrap-count">
                           <img className="bookmark-icon" src={bookmarkIcon} alt="북마크" />
                           <span className="bookmark-count">{recipe.SCRAP_COUNT || recipe.scrap_count || 0}</span>
                         </span>
                       </div>
                       
                       {/* 레시피 태그 */}
                       <div className="recipe-tags">
                         <span className="recipe-tag">{recipe.COOKING_CATEGORY_NAME || recipe.cooking_category_name}</span>
                         <span className="recipe-tag">{recipe.COOKING_CASE_NAME || recipe.cooking_case_name}</span>
                       </div>
                     </div>
                   </div>
                   
                   {/* 구분선 */}
                   <hr className="recipe-divider" />
                 </div>
               );
             })}
           </>
         )}
        {!loading && !error && recipes.length === 0 && (
          <div className="no-results">
            <p>검색 결과가 없습니다.</p>
            <p>다른 재료로 다시 시도해보세요.</p>
          </div>
        )}
      </main>

                          {/* 조합 요약 정보 */}
       {recipes.length > 0 && allPossibleRecipes.length > 1 && (
         <div className="combinations-summary">
           <h4>총 {allPossibleRecipes.length}개의 레시피 조합을 찾았습니다</h4>
           <div className="combination-types">
             {allPossibleRecipes.map((combination, index) => (
               <div key={index} className="combination-info">
                 <span className="combination-number">#{index + 1}</span>
                 <span className="combination-type-label">{combination.combinationType}</span>
                 <span className="combination-count">{combination.recipes.length}개 레시피</span>
               </div>
             ))}
           </div>
         </div>
       )}

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};

export default RecipeResult; 

