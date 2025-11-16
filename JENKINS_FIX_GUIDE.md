# Jenkins API Not Found - Fix Guide 🔧

## Problem
Jenkins API returning "Not Found" error when triggering build.

## Updated Code ✅
The backend route has been updated with:
1. **ngrok header**: `ngrok-skip-browser-warning: true`
2. **Better logging**: Shows full URL and auth status
3. **Test endpoint**: `/api/admin/test-jenkins` to verify connection

## Steps to Fix

### 1. Kill Process on Port 3000
```powershell
# Find process
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Kill it (replace PID with actual process ID)
Stop-Process -Id <PID> -Force
```

### 2. Restart Backend
```bash
cd backend
npm run dev
```

### 3. Verify Jenkins Job Name
Check your Jenkins dashboard and verify:
- Job name is exactly: `ecobin-pipeline`
- Or update `.env` with correct job name

### 4. Test Jenkins Connection
```bash
# Test if Jenkins is accessible
curl https://21946077ea38.ngrok-free.app/api/json
```

### 5. Common Issues & Solutions

#### Issue: 404 Not Found
**Possible causes:**
- Wrong job name
- Job doesn't exist in Jenkins
- URL path is incorrect

**Solution:**
```env
# Check exact job name in Jenkins
# Update .env if needed
JENKINS_JOB=your-actual-job-name
```

#### Issue: 401 Unauthorized
**Possible causes:**
- Wrong username/password
- API token expired

**Solution:**
```env
# Generate new API token in Jenkins
# User → Configure → API Token
JENKINS_TOKEN=new-token-here
```

#### Issue: ngrok URL not working
**Possible causes:**
- ngrok session expired
- URL changed

**Solution:**
```bash
# Get new ngrok URL
ngrok http 8080

# Update .env
JENKINS_URL=https://new-ngrok-url.ngrok-free.app
```

## Correct Jenkins URL Format

### For build with token:
```
{JENKINS_URL}/job/{JOB_NAME}/build?token={BUILD_TOKEN}
```

### Example:
```
https://21946077ea38.ngrok-free.app/job/ecobin-pipeline/build?token=JENKINS_ECOBIN
```

## Testing Steps

### 1. Test Jenkins API directly:
```bash
curl -X POST \
  -u admin:YOUR_API_TOKEN \
  "https://21946077ea38.ngrok-free.app/job/ecobin-pipeline/build?token=JENKINS_ECOBIN"
```

### 2. Check backend logs:
Look for these messages:
```
🚀 Triggering Jenkins build...
Jenkins URL: https://...
Jenkins Job: ecobin-pipeline
Build Token: JENKINS_ECOBIN
Auth configured: Yes
✅ Jenkins response status: 201
```

### 3. If you see 404:
- Verify job exists: `https://YOUR_NGROK_URL/job/ecobin-pipeline`
- Check job name spelling
- Ensure job is not in a folder (use `/job/folder/job/name` if it is)

## Environment Variables Checklist

```env
✅ JENKINS_URL=https://21946077ea38.ngrok-free.app
✅ JENKINS_JOB=ecobin-pipeline
✅ JENKINS_USER=admin
✅ JENKINS_TOKEN=114ad036059b623eabbed2fbfcf3ce21f3
✅ JENKINS_BUILD_TOKEN=JENKINS_ECOBIN
```

## Quick Debug Commands

```bash
# 1. Check if backend is running
curl http://localhost:3000/api/health

# 2. Test Jenkins connection (requires admin login)
curl http://localhost:3000/api/admin/test-jenkins \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Trigger build (requires admin login)
curl -X POST http://localhost:3000/api/admin/deploy \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Next Steps

1. **Kill port 3000 process**
2. **Restart backend**
3. **Check Jenkins job name**
4. **Test the deploy button**
5. **Check backend logs for detailed error**

---
**Note**: Make sure Jenkins job "ecobin-pipeline" exists and has "Trigger builds remotely" enabled with token "JENKINS_ECOBIN"
