# Direct Pathway to APK (Android Studio)

You want to turn this project into a "YT Music" style APK. Follow these steps exactly:

## 1. Prerequisites on your PC
- **Android Studio**: [Download here](https://developer.android.com/studio)
- **Node.js**: [Download here](https://nodejs.org/)

## 2. Setup the Project
1. Export this project from AI Studio as a **ZIP**.
2. Extract the ZIP on your computer.
3. Open a terminal/command prompt in that folder.
4. Run the following commands:
   ```bash
   # Install dependencies
   npm install

   # Create the production build (Static Files)
   npm run build

   # Sync the code with the Android Folder
   npx cap add android
   npx cap copy
   ```

## 3. Building in Android Studio
1. Open **Android Studio**.
2. Click **Open** and select the **`android`** folder inside your project.
3. Wait for the "Gradle Sync" to finish (a green bar at the bottom).
4. Go to the top menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. When finished, a notification will appear. Click **"locate"** to find your `app-debug.apk`.

## 4. Why this works for Background Play
Because we are using **Capacitor**, the app runs as a native application. 
- The `server.ts` handles the audio streaming.
- The "Silent Audio" trick we implemented ensures the Android OS doesn't kill the app when you minimize it.
- In Android Studio, you can add the `Background Mode` permission in `AndroidManifest.xml` if needed.
