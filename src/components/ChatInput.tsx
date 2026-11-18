import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { IconArrowU } from "../icons";
import styles from "./ChatInput.module.css";

type ChatInputProps = {
  value?: string;
  placeholder?: string;
  onSend?: () => void;
  sendLabel?: ReactNode;
  sendButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "placeholder">;

export function ChatInput({
  value = "",
  placeholder = "메세지를 입력하세요",
  onSend,
  sendLabel,
  sendButtonProps,
  className,
  disabled,
  onKeyDown,
  ...rest
}: ChatInputProps) {
  const filled = value.trim().length > 0;
  const classes = [styles.bar, className ?? ""].filter(Boolean).join(" ");
  const sendDisabled = disabled || !filled || sendButtonProps?.disabled;

  return (
    <div className={classes}>
      <input
        className={styles.field}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            !event.defaultPrevented &&
            event.key === "Enter" &&
            filled &&
            !disabled
          ) {
            onSend?.();
          }
        }}
        {...rest}
      />
      <button
        type="button"
        className={filled ? styles.sendActive : styles.sendIdle}
        aria-label={typeof sendLabel === "string" ? sendLabel : "보내기"}
        {...sendButtonProps}
        disabled={sendDisabled}
        onClick={onSend}
      >
        {sendLabel ?? <IconArrowU />}
      </button>
    </div>
  );
}
