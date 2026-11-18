import type { HTMLAttributes, ReactNode } from "react";
import { IconRight as IconRightAsset } from "../icons";
import styles from "./AiJobCard.module.css";

export type AiJobStepState = "done" | "todo";

export type AiJobStep = {
  label: ReactNode;
  state?: AiJobStepState;
  /** 스텝 옆 브랜드 아이콘 등 */
  icons?: ReactNode;
};

type AiJobCardProps = {
  title: ReactNode;
  status: ReactNode;
  steps: AiJobStep[];
  storageLabel?: ReactNode;
  /** 예: ['Notion', '강변 촬영', '레퍼런스'] */
  storagePath?: ReactNode[];
  storageIcon?: ReactNode;
} & HTMLAttributes<HTMLElement>;

function CheckDone() {
  return (
    <span className={styles.checkDone} aria-hidden="true">
      <svg viewBox="0 0 8 6" width="8" height="6" focusable="false">
        <path
          d="M1.2 3.1L3 4.9L6.8 1.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function CheckTodo() {
  return <span className={styles.checkTodo} aria-hidden="true" />;
}

/** DS Assets `IconRight` — 경로 14px 글자에 맞춰 16으로 축소. */
function IconRight() {
  return (
    <span className={styles.chevron} aria-hidden="true">
      <IconRightAsset size={16} />
    </span>
  );
}

function NotionMark() {
  return (
    <span className={styles.notionMark} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" focusable="false">
        <path
          fill="currentColor"
          d="M4.5 3.5h12.2c.6 0 1.1.2 1.5.7l1.3 1.6c.3.4.5.8.5 1.3v12.4c0 .8-.7 1.5-1.5 1.5H6.2c-.6 0-1.1-.2-1.5-.7L3.4 18.7c-.3-.4-.5-.8-.5-1.3V5c0-.8.7-1.5 1.6-1.5Zm1.3 2.2v11.6l1.2 1.3h10.3V7.1L16 5.7H5.8Zm3.2 2.3h1.6v7.2H7.8l1.2-1.2V7.99Zm5.1 0c1.5 0 2.5.9 2.5 2.3 0 1.1-.5 1.8-1.3 2.2l1.6 2.7h-1.9l-1.4-2.4h-.4v2.4h-1.6V8h2.5Zm0 1.4h-.9v1.8h.9c.6 0 1-.3 1-.9s-.4-.9-1-.9Z"
        />
      </svg>
    </span>
  );
}

export function AiJobCard({
  title,
  status,
  steps,
  storageLabel = "저장 위치",
  storagePath = ["Notion", "강변 촬영", "레퍼런스"],
  storageIcon,
  className,
  ...rest
}: AiJobCardProps) {
  const classes = [styles.card, className ?? ""].filter(Boolean).join(" ");

  return (
    <article className={classes} {...rest}>
      <header className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.status}>{status}</p>
      </header>

      <div className={styles.body}>
        <ol className={styles.steps}>
          {steps.map((step, index) => {
            const done = (step.state ?? "todo") === "done";
            return (
              <li
                key={index}
                className={done ? styles.stepDone : styles.stepTodo}
              >
                {done ? <CheckDone /> : <CheckTodo />}
                <span className={styles.stepLabel}>{step.label}</span>
                {step.icons ? (
                  <span className={styles.stepIcons}>{step.icons}</span>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.storage}>
          <p className={styles.storageLabel}>{storageLabel}</p>
          <div className={styles.path}>
            {storageIcon ?? <NotionMark />}
            <div className={styles.breadcrumb}>
              {storagePath.map((seg, index) => (
                <span key={index} className={styles.pathItem}>
                  {index > 0 ? <IconRight /> : null}
                  <span>{seg}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
