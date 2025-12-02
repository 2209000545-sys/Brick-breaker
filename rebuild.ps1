# Verifica que Java esté instalado
Write-Host " Verificando Java..."
java -version
if ($LASTEXITCODE -ne 0) {
    Write-Host " Java no está instalado o no está en el PATH. Instala JDK 17 y configura JAVA_HOME."
    exit 1
}

# Limpieza de node_modules y caché de Gradle
Write-Host " Limpiando node_modules y caché de Gradle..."
rmdir /s /q node_modules
rmdir /s /q android\.gradle
rmdir /s /q android\build

# Reinstalación de dependencias
Write-Host " Instalando dependencias..."
npm install

# Limpieza de Gradle
Write-Host " Ejecutando gradlew clean..."
cd android
./gradlew clean
cd ..

# Reinicio de Metro bundler con caché limpio
Write-Host "Iniciando Metro bundler con caché limpio..."
Start-Process powershell -ArgumentList "npm start -- --reset-cache" -NoNewWindow

# Compilación en Android
Write-Host "Compilando proyecto en Android..."
npx react-native run-android


# Compilación en Android
Write-Host " Compilando proyecto en Android..."
npx react-native run-android
