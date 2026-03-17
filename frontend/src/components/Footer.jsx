import React from "react";
import { GithubOutlined, MailOutlined } from "@ant-design/icons";

export default function Footer({
  projectName = "Chill - Auto AI form",
  owner = "Darkin72",
  repoUrl = "https://github.com/darkin72/auto-google-form",
  contactPath = "/contact",
  startYear = 2025,
}) {
  const year = new Date().getFullYear();
  const yearText = startYear === year ? `${year}` : `${startYear}–${year}`;

  return (
    <footer className="w-full border-t border-blue-200 s dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <div className="text-sm text-gray-900 dark:text-gray-900">
              <span className="font-medium">
                © {yearText} {projectName}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-gray-900 dark:text-gray-600">
              by <span className="font-mono font-semibold">{owner}</span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-gray-900 underline-offset-4 hover:underline dark:text-gray-900"
            >
              Mã nguồn (GitHub)
            </a>
            <a
              href="/LICENSE"
              className="text-gray-900 underline-offset-4 hover:underline dark:text-gray-900"
            >
              MIT License
            </a>
            <a
              href={contactPath}
              className="text-gray-900 underline-offset-4 hover:underline"
            >
              Liên hệ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-xl p-2 ring-1 w-[48px] h-[48px] flex items-center justify-center ring-gray-300 transition hover:text-white hover:bg-gray-100 dark:ring-zinc-800 dark:hover:bg-zinc-900"
              aria-label="GitHub"
              title="GitHub"
            >
              <GithubOutlined style={{ fontSize: 24 }} />
            </a>
            <a
              href={contactPath}
              className="rounded-xl p-2 ring-1 w-[48px] h-[48px] flex items-center justify-center ring-gray-300 transition hover:text-white hover:bg-gray-100 dark:ring-zinc-800 dark:hover:bg-zinc-900"
              aria-label="Liên hệ"
              title="Liên hệ"
            >
              <MailOutlined style={{ fontSize: 24 }} />
            </a>
          </div>
        </div>

        <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-zinc-800" />

        <div className="flex flex-col items-center justify-between gap-2 text-center text-xs text-gray-900 sm:flex-row dark:text-gray-600">
          <p>
            <span className="font-semibold">Mã nguồn</span> theo giấy phép{" "}
            <a
              href="/LICENSE"
              className="underline underline-offset-4 hover:no-underline"
            >
              MIT
            </a>
            . Bạn có quyền sử dụng, chỉnh sửa, phân phối (kèm theo thông báo bản
            quyền & license).
          </p>
          <p>
            <span className="font-semibold">Nội dung website</span> (branding,
            logo, hình ảnh, copy,…):{" "}
            <span className="font-medium">All Rights Reserved</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
