// /live-stream 경로 페이지 (검색 → API → Player 연결)
// 라이브 스트림 페이지 컴포넌트

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchLiveStreamInfo } from "../api/homeShoppingApi";
import { useHlsPlayer } from "../hooks/useHlsPlayer";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:9001";

export default function LiveStream() {
  const [sp, setSp] = useSearchParams();
  const initialUrl = sp.get("homeshopping_url") || "";
  const [hsUrl, setHsUrl] = useState(initialUrl);
  const [m3u8, setM3u8] = useState("");
  const [meta, setMeta] = useState({ channel: "-", title: "-", source: "-" });
  const [status, setStatus] = useState("준비됨");

  const onStatus = useCallback((msg) => setStatus(msg), []);
  const { videoRef } = useHlsPlayer(m3u8, { onStatus });

  const canLoad = useMemo(() => hsUrl.trim().length > 0, [hsUrl]);

  const load = useCallback(async () => {
    if (!canLoad) {
      setStatus("홈쇼핑 URL을 입력하세요.");
      return;
    }
    try {
      setStatus("정보 조회 중…");
      const info = await fetchLiveStreamInfo(API_BASE, hsUrl.trim());
      if (!info.m3u8) throw new Error("응답에 m3u8 주소가 없습니다.");
      setMeta({ channel: info.channel, title: info.title, source: info.source });
      setM3u8(info.m3u8);
      // URL 동기화
      const next = new URL(window.location.href);
      next.searchParams.set("homeshopping_url", hsUrl.trim());
      window.history.replaceState({}, "", next);
    } catch (e) {
      setStatus(`실패: ${e.message}`);
    }
  }, [canLoad, hsUrl]);

  // 처음 들어올 때 쿼리스트링에 있으면 자동 로드
  useEffect(() => {
    if (initialUrl) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={styles.wrap}>
      <h1 style={styles.h1}>홈쇼핑 라이브 재생</h1>

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
              if (videoRef.current) {
                videoRef.current.muted = !videoRef.current.muted;
                setStatus(videoRef.current.muted ? "음소거 상태" : "음소거 해제");
              }
            }}
            style={styles.btn}
          >
            음소거 토글
          </button>
        </div>
        <div style={styles.status}>{status}</div>
      </div>

      <video ref={videoRef} playsInline controls muted style={styles.video} />

      <div style={styles.panel}>
        <div style={styles.meta}>
          <div><b>채널</b> {meta.channel}</div>
          <div><b>제목</b> {meta.title}</div>
          <div><b>원본</b> {meta.source}</div>
          <div><b>M3U8</b> {m3u8 || "-"}</div>
        </div>
      </div>

      <p style={styles.footnote}>
        플레이 정보는 <code>{API_BASE}/schedule/live-stream/info?homeshopping_url=...</code> 에서 가져옵니다.
      </p>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 960, margin: "0 auto", padding: 16, color: "#e7e7ea", background: "#0b0b0c", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple SD Gothic Neo, Noto Sans KR, sans-serif" },
  h1: { fontSize: 18, margin: "0 0 16px", opacity: 0.9 },
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
