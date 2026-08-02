待辦事項：
- [ ] setting.js SITE_FIELDS增加theme_url字段
- [ ] 後臺主題商店選擇主題以及版本，點擊切換主題，保存到setting.js，格式為theme_url: 'https://github.com/huilang-me/CFSM-Theme-Store/tree/4e272b26193e35430261657b85e82c61d9dbf557/Tokinx/cf-server-monitor-theme-emerald/v1.0.10'，注意commitid以及版本號
- [ ] 前臺根據setting.js中的theme_url字段，獲取對應的github raw url(https://raw.githubusercontent.com/huilang-me/CFSM-Theme-Store/4e272b26193e35430261657b85e82c61d9dbf557/Tokinx/cf-server-monitor-theme-emerald/v1.0.10/index.html)，workers反代index.html以及assets目錄下的所有文件，並且設置緩存時間為1小時
- [ ] 替換前端的index.html為workers反代的index.html，CSP和背景圖，title注入等同樣應用。注意僅代理index.html和assets目錄，其他文件直接返回原有的文件
- [ ] 主題商店增加預覽主題，在登錄狀態下，點擊預覽主題，跳轉到?theme_url=theme_url,實現臨時替換setting.js中的theme_url字段方案預覽主題。
