import { openUrl } from "@tauri-apps/plugin-opener";
import { CheckCircle2, CircleAlert, Download, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import type { AppUpdateState } from "../lib/useAppUpdate";
import { Button } from "./Button";

type AppUpdatePanelProps = {
  updateState: AppUpdateState;
  busy: boolean;
  onCheckUpdate: () => void;
  onInstallUpdate: () => void;
};

const LATEST_RELEASE_URL = "https://github.com/dota-pilot1/donation-admin-tauri/releases/latest";

export function AppUpdatePanel({ updateState, busy, onCheckUpdate, onInstallUpdate }: AppUpdatePanelProps) {
  const checking = updateState.status === "checking";
  const downloading = updateState.status === "downloading";
  const available = updateState.status === "available" || downloading;
  const openLatestRelease = () => {
    void openUrl(LATEST_RELEASE_URL);
  };

  return (
    <section className="app-update-panel">
      <div className="app-update-panel-head">
        <div>
          <strong>앱 업데이트</strong>
          <span>현재 버전 v{updateState.currentVersion}</span>
        </div>
        <div className="app-update-actions">
          <Button size="sm" variant="outline" onClick={openLatestRelease}>
            <ExternalLink size={16} />
            릴리즈 페이지
          </Button>
          <Button size="sm" variant="outline" onClick={onCheckUpdate} disabled={busy}>
            {checking ? <Loader2 className="spin" size={16} /> : <RefreshCw size={16} />}
            {checking ? "확인 중" : "업데이트 확인"}
          </Button>
        </div>
      </div>

      {updateState.status === "uptodate" && (
        <div className="app-update-message success">
          <CheckCircle2 size={17} />
          최신 버전을 사용 중입니다.
        </div>
      )}

      {updateState.status === "error" && (
        <div className="app-update-message error">
          <span>
            <CircleAlert size={17} />
            {updateState.message || "업데이트를 확인하지 못했습니다."}
          </span>
          <button className="app-update-link-button" onClick={openLatestRelease} type="button">
            릴리즈에서 확인
            <ExternalLink size={14} />
          </button>
        </div>
      )}

      {available && (
        <div className="app-update-available">
          <div>
            <strong>새 버전 v{updateState.availableVersion}</strong>
            <span>설치 후 앱이 재시작됩니다.</span>
          </div>
          {updateState.notes && <p>{updateState.notes}</p>}
          {downloading && (
            <div className="app-update-progress">
              <div style={{ width: `${updateState.progress}%` }} />
            </div>
          )}
          <Button size="sm" onClick={onInstallUpdate} disabled={busy && !downloading}>
            {downloading ? <Loader2 className="spin" size={16} /> : <Download size={16} />}
            {downloading ? `다운로드 ${updateState.progress}%` : "지금 업데이트"}
          </Button>
        </div>
      )}
    </section>
  );
}
