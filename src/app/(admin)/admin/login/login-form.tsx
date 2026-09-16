"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <label className="a-field">
        <span className="a-label">이메일</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="a-input"
        />
      </label>

      <label className="a-field">
        <span className="a-label">비밀번호</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="a-input"
        />
      </label>

      {state.error && <p className="a-error">{state.error}</p>}

      <button type="submit" disabled={pending} className="a-btn a-btn-primary">
        {pending ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
