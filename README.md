# Shilpa-Kala: Digital Portfolio Assistant for Artisans

Shilpa-Kala is a premium Android application designed for traditional artisans in Karnataka, India. It helps them capture high-quality product photos, automatically brand them with AI-generated heritage descriptions, and maintain a digital portfolio.

## Project Structure

- **`app/src/main/java/com/shilpakala/app/`**
    - **`activities/`**: Contains all the UI screens (Splash, Profile, Home, Camera, Product Details, Preview, Gallery).
    - **`models/`**: Data models like `ArtisanProfile`.
    - **`utils/`**: Helper classes for Shared Preferences, Bitmap manipulation, and Gemini AI integration.
    - **`adapters/`**: RecyclerView adapters for the gallery.
    - **`views/`**: Custom views like the Camera Overlay.
- **`app/src/main/res/`**
    - **`layout/`**: XML layouts for all screens and components.
    - **`drawable/`**: Custom backgrounds, gradients, and vector icons.
    - **`values/`**: Colors, strings, and themes (Material 3 Dark).
    - **`xml/`**: FileProvider paths and backup configurations.

## Core Features

### 1. AI-Powered Branding
The app integrates with **Google's Gemini 1.5 Flash** model to analyze captured product photos and generate poetic heritage descriptions in under 20 words.

### 2. Custom Branding Overlay
A dedicated utility (`BitmapOverlayHelper`) overlays the following on photos:
- "HANDMADE IN KARNATAKA" header.
- Artisan's name and location.
- Product details and material.
- Price in a vibrant accent color (#E94560).
- AI-generated heritage label.

### 3. Professional Camera Experience
A custom CameraX implementation with a dashed framing rectangle helps artisans take centered, consistent product shots.

### 4. Digital Portfolio
Artisans can save their branded photos to a dedicated "Shilpa-Kala" album in the device gallery and view them in a sleek, dark-themed grid within the app.

## Getting Started

1. **API Key**: Open `app/src/main/java/com/shilpakala/app/activities/ProductDetailActivity.kt` and replace `"YOUR_GEMINI_API_KEY_HERE"` with your actual Google AI Studio API key.
2. **Build**: Use Android Studio (Iguana or later recommended) to sync Gradle and build the project.
3. **Run**: Deploy to a device running Android 8.0 (API 26) or higher.

## Technologies Used

- **Language**: Kotlin
- **UI**: ViewBinding, ConstraintLayout, Material Components
- **Camera**: Jetpack CameraX
- **Network**: Retrofit 2, OkHttp 3
- **AI**: Google Gemini API
- **Image Loading**: Glide 4
- **Concurrency**: Kotlin Coroutines & Lifecycle Scopes


View app in AI Studio: https://ai.studio/apps/d730323e-f767-46bd-b996-8502b4849131

## Run Locally

Deployed using Vercel: https://shilpa-kala.vercel.app


