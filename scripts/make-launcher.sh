#!/bin/bash
# Tạo app "Ôn tập" trong ~/Applications — mở bằng Spotlight (⌘ Space → "On tap") hoặc kéo vào Dock.
#   Máy chủ chưa chạy → chạy ngầm rồi mở trình duyệt ở localhost:5180.
#   Đang chạy        → hỏi: Mở (Enter) hay Tắt máy chủ.
# Đường dẫn repo và node được ghi cứng vào app lúc tạo ⇒ chuyển thư mục repo thì chạy lại: npm run launcher
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
NODE_DIR="$(dirname "$(command -v node)")"
APP="$HOME/Applications/Ôn tập.app"
LOG="$HOME/Library/Logs/on-tap.log"

[ -d "$REPO/node_modules" ] || (cd "$REPO" && npm install)
mkdir -p "$HOME/Applications"
rm -rf "$APP"

osacompile -o "$APP" - <<EOF
property repo : "$REPO"
property nodeDir : "$NODE_DIR"
property logFile : "$LOG"
property appURL : "http://localhost:5180"

on isUp()
	try
		do shell script "curl -s -o /dev/null --max-time 1 " & appURL
		return true
	on error
		return false
	end try
end isUp

on run
	if isUp() then
		set choice to button returned of (display dialog "Ôn tập đang chạy." buttons {"Tắt máy chủ", "Mở"} default button "Mở" with title "Ôn tập")
		if choice is "Tắt máy chủ" then
			do shell script "lsof -ti tcp:5180 -sTCP:LISTEN | xargs kill"
			return
		end if
	else
		-- (… &) trong ngoặc: shell con thoát ngay, vite không giữ ống xuất ⇒ do shell script trả về liền.
		-- Viết "cd … && vite &" thì cả cụm chạy nền giữ ống xuất, app treo mãi không mở được trình duyệt.
		do shell script "cd " & quoted form of repo & " && (PATH=" & quoted form of nodeDir & ":\$PATH nohup node_modules/.bin/vite > " & quoted form of logFile & " 2>&1 < /dev/null &)"
		repeat 60 times
			delay 0.25
			if isUp() then exit repeat
		end repeat
		if not isUp() then
			display dialog "Không khởi động được máy chủ. Xem nhật ký: " & logFile buttons {"OK"} default button "OK" with title "Ôn tập" with icon stop
			return
		end if
	end if
	open location appURL
end run
EOF

echo "Đã tạo: $APP"
