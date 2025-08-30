// /live-stream 경로 페이지 (검색 → API → Player 연결)
// 라이브 스트림 페이지 컴포넌트

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { homeShoppingApi } from "../api/homeShoppingApi";
import LiveStreamPlayer from "../components/player/LiveStreamPlayer";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9001";

export default function LiveStream() {
  const [sp, setSp] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 전달받은 스트림 정보 확인
  const streamInfo = location.state;
  
  const initialUrl = sp.get("homeshopping_url") || streamInfo?.streamUrl || "";
  const [hsUrl, setHsUrl] = useState(initialUrl);
  const [m3u8, setM3u8] = useState(streamInfo?.streamUrl || "");
  
  // m3u8 상태 변경 시 로깅
  useEffect(() => {
    console.log('🎬 m3u8 상태 변경:', m3u8);
  }, [m3u8]);
  const [meta, setMeta] = useState({ 
    channel: streamInfo?.homeshoppingId || "-", 
    title: streamInfo?.productName || "-", 
    source: streamInfo?.streamUrl || "-" 
  });
  const [status, setStatus] = useState(streamInfo?.streamUrl ? "스트림 로딩 중..." : "준비됨");

  const onStatus = useCallback((msg) => setStatus(msg), []);

  const canLoad = useMemo(() => hsUrl.trim().length > 0, [hsUrl]);

  const load = useCallback(async () => {
    if (!canLoad) {
      setStatus("홈쇼핑 URL을 입력하세요.");
      return;
    }
    try {
      setStatus("정보 조회 중…");
      
      // API 명세서에 맞게 homeshopping_id 또는 src 파라미터로 호출
      let streamResponse;
      if (hsUrl.trim().startsWith('http')) {
        // URL이 직접 입력된 경우 src 파라미터로 사용
        streamResponse = await homeShoppingApi.getLiveStreamUrl(null, hsUrl.trim());
      } else {
        // 숫자인 경우 homeshopping_id로 사용
        const homeshoppingId = parseInt(hsUrl.trim());
        if (isNaN(homeshoppingId)) {
          throw new Error("유효한 homeshopping_id 또는 URL을 입력하세요.");
        }
        streamResponse = await homeShoppingApi.getLiveStreamUrl(homeshoppingId);
      }
      
      if (!streamResponse?.stream_url) throw new Error("응답에 m3u8 주소가 없습니다.");
      
      setMeta({ 
        channel: streamResponse.channel || "-", 
        title: streamResponse.title || "-", 
        source: streamResponse.source || hsUrl.trim() 
      });
      setM3u8(streamResponse.stream_url);
      
      // URL 동기화
      const next = new URL(window.location.href);
      next.searchParams.set("homeshopping_url", hsUrl.trim());
      window.history.replaceState({}, "", next);
    } catch (e) {
      setStatus(`실패: ${e.message}`);
    }
  }, [canLoad, hsUrl]);

  // 처음 들어올 때 전달받은 스트림 정보나 쿼리스트링이 있으면 자동 로드
  useEffect(() => {
    console.log('🔍 LiveStreamPage 초기화:', { streamInfo, initialUrl });
    
    if (streamInfo?.streamUrl) {
      // 전달받은 스트림 URL이 있으면 바로 재생
      console.log('✅ 전달받은 스트림 URL로 설정:', streamInfo.streamUrl);
      setM3u8(streamInfo.streamUrl);
      setStatus("스트림 재생 중...");
    } else if (initialUrl) {
      // 쿼리스트링에 URL이 있으면 로드
      console.log('🔄 쿼리스트링 URL로 로드:', initialUrl);
      load();
    } else {
      console.log('⚠️ 스트림 정보가 없음');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <button 
          onClick={() => navigate(-1)} 
          style={styles.backButton}
        >
          ← 뒤로가기
        </button>
        <h1 style={styles.h1}>홈쇼핑 라이브 재생</h1>
      </div>

      <div style={styles.panel}>
        <div style={styles.controls}>
          <input
            value={hsUrl}
            onChange={(e) => setHsUrl(e.target.value)}
            placeholder="홈쇼핑 상품/방송 URL 입력"
            style={styles.input}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          <button onClick={load} style={styles.btnPrimary}>불러오기</button>
          <button
            onClick={() => {
              const v = sp.get("homeshopping_url") || hsUrl;
              setHsUrl(v || "");
              load();
            }}
            style={styles.btn}
          >
            다시 시도
          </button>
          <button
            onClick={() => {
              setStatus("음소거 토글 기능은 비디오 플레이어에서 직접 조작하세요");
            }}
            style={styles.btn}
          >
            음소거 토글
          </button>
        </div>
        <div style={styles.status}>{status}</div>
      </div>

      <LiveStreamPlayer
        src={m3u8}
        autoPlay={false}
        muted={true}
        controls={true}
        width="100%"
        height="400px"
        onError={(error) => {
          console.error('스트림 오류:', error);
          setStatus(`스트림 오류: ${error.message || '알 수 없는 오류'}`);
        }}
        onLoadStart={() => {
          console.log('스트림 로딩 시작');
          setStatus('스트림 로딩 중...');
        }}
        onLoadedData={() => {
          console.log('스트림 로딩 완료');
          setStatus('스트림 재생 준비 완료');
        }}
        key={m3u8} // URL이 변경될 때마다 컴포넌트 재생성
      />

      {/* 스트림 오류 시 재시도 버튼 */}
      {status.includes('오류') && m3u8 && (
        <div style={styles.panel}>
          <div style={styles.status}>
            <strong>스트림 오류가 발생했습니다</strong>
            <br />
            <small>아래 버튼을 클릭하여 재시도하거나, 다른 스트림을 시도해보세요.</small>
          </div>
          <div style={styles.controls}>
            <button 
              onClick={() => {
                setStatus('스트림 재시도 중...');
                // URL을 강제로 변경하여 컴포넌트 재생성
                const currentUrl = m3u8;
                setM3u8('');
                setTimeout(() => setM3u8(currentUrl), 100);
              }} 
              style={styles.btnPrimary}
            >
              🔄 스트림 재시도
            </button>
            <button 
              onClick={() => {
                setM3u8('');
                setStatus('스트림이 중지되었습니다');
              }} 
              style={styles.btn}
            >
              ⏹️ 스트림 중지
            </button>
          </div>
        </div>
      )}

      <div style={styles.panel}>
        <div style={styles.meta}>
          <div><b>채널</b> {meta.channel}</div>
          <div><b>제목</b> {meta.title}</div>
          <div><b>원본</b> {meta.source}</div>
          <div><b>M3U8</b> {m3u8 || "-"}</div>
        </div>
      </div>

      <p style={styles.footnote}>
        플레이 정보는 <code>{API_BASE}/api/homeshopping/schedule/live-stream</code> 에서 가져옵니다.
        <br />
        <small>homeshopping_id 또는 src 파라미터를 사용하여 스트림 정보를 조회합니다.</small>
      </p>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 960, margin: "0 auto", padding: 16, color: "#e7e7ea", background: "#0b0b0c", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple SD Gothic Neo, Noto Sans KR, sans-serif" },
  header: { display: "flex", alignItems: "center", gap: 16, marginBottom: 16 },
  backButton: { padding: "8px 16px", borderRadius: 8, background: "#2b2b30", color: "white", border: "none", cursor: "pointer", fontSize: 14 },
  h1: { fontSize: 18, margin: 0, opacity: 0.9 },
  panel: { background: "#111114", border: "1px solid #23232a", borderRadius: 14, padding: 12, marginBottom: 12 },
  controls: { display: "flex", gap: 8, flexWrap: "wrap" },
  input: { flex: "1 1 420px", padding: "10px 12px", borderRadius: 10, border: "1px solid #2b2b30", background: "#151518", color: "#f2f2f4" },
  btn: { padding: "10px 14px", borderRadius: 10, background: "#2b2b30", color: "white", border: "none", cursor: "pointer" },
  btnPrimary: { padding: "10px 14px", borderRadius: 10, background: "#3a5cff", color: "white", border: "none", cursor: "pointer" },
  status: { fontSize: 13, opacity: 0.85 },
  video: { width: "100%", maxHeight: "70vh", background: "black", borderRadius: 14, marginTop: 8 },
  meta: { fontSize: 14, opacity: 0.95, display: "flex", gap: 10, flexWrap: "wrap" },
  footnote: { fontSize: 13, opacity: 0.8 },
};
