===============================
DEVICE CLIENT - QUICK SETUP
===============================

📦 Requirements:
- Python 3.8+
- Internet connection
- `pip` installed

-------------------------------
🪟 WINDOWS SETUP
-------------------------------

1. Open Command Prompt and run:
   install.bat

2. After setup completes, run:
   run.bat

3. To auto-start the client at login:
   - Press Win + R → type: shell:startup
   - Copy a shortcut to run.bat into that folder

-------------------------------
🐧 LINUX SETUP
-------------------------------

1. Open Terminal and run:
   chmod +x run.sh
   ./run.sh

2. To auto-start at login (optional):
   - Add `./run.sh` to your crontab or systemd service
   - Example (crontab):
     crontab -e
     @reboot /path/to/run.sh

-------------------------------
🔧 CONFIGURATION (.env)
-------------------------------

Edit the `.env` file to set:

- `DEVICE_ID=your_device_name`
- `SERVER_URL=http://your-api-endpoint`
- `SEND_INTERVAL=30`  (in seconds)

-------------------------------
🧾 LOGS & MONITORING
-------------------------------

- Output is printed in terminal
- Ensure device has network access
- Troubleshoot using printed status codes

