call npm ci
call npm test -- --browsers=chromium,firefox --terse --headless --set-env qx.test.delay.scale=10
