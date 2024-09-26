const builder = require('electron-builder')
const nodeFetch = require('node-fetch')
const fs = require("fs");
const png2icons = require('png2icons');
const Jimp = require('jimp');
const { preductname } = require('./package.json')

class Index {
    async build() {
        builder.build({
            config: {
                generateUpdatesFilesForAllChannels: false,
                appId: 'com.github.psycodeliccircus.launchermod',
                productName: 'launchermod',
                icon: "./build/icon.ico",
                copyright: "Copyright © 1984-2024 Launcher Mods - Dev by RenildoMarcio",
                artifactName: "${productName}-${os}-${arch}-${target}.${ext}",
                files: ["**/*", "package.json", "LICENSE.md"],
                directories: { "output": "dist" },
                compression: 'maximum',
                asar: true,
                publish: [{
                    provider: "github",
                    releaseType: 'release',
                }],
                win: {
                    icon: "./build/icon.ico",
                    target: [
                        {
                            target: "nsis", // Instalador
                            arch: ["x64"],
                            artifactName: "${productName}-${os}-${arch}-installer.${ext}" // Nome específico para o instalador
                        },
                        {
                            target: "portable", // Portátil
                            arch: ["x64"],
                            artifactName: "${productName}-${os}-${arch}-portable.${ext}" // Nome específico para a versão portátil
                        }
                    ],
                },
                nsis: {
                    installerIcon: "./build/icon.ico",
                    uninstallerIcon: "./build/uninstall.ico",
                    oneClick: false,
                    allowToChangeInstallationDirectory: true,
                    runAfterFinish: true,
                    createStartMenuShortcut: true,
                    packElevateHelper: true,
                    createDesktopShortcut: true,
                    shortcutName: "Launcher Mods",
                    license: "./eula.txt"
                },
                mac: {
                    icon: "./build/icon.icns",
                    category: "public.app-category.games",
                    target: [{
                        target: "dmg",
                        arch: ["x64", "arm64"]
                    }],
                    entitlements: "build/entitlements.plist",
                    entitlementsInherit: "build/entitlementsInherit.plist"
                },
                linux: {
                    icon: "./build/icon.png",
                    target: [{
                        target: "AppImage",
                        arch: ["x64"]
                    }, {
                        target: "tar.gz",
                        arch: ["x64"]
                    }]
                },
                // Aqui é onde você adiciona o extraResources
                extraResources: [
                    {
                        from: "build/icon.png", // Caminho da sua pasta de ícones ou qualquer outro arquivo
                        to: "build/icon.png" // O destino no diretório final
                    }
                ]
            }
        }).then(() => {
            console.log('A build está concluída')
        }).catch(err => {
            console.error('Erro durante a build!', err)
        })
    }

    async iconSet(url) {
        let Buffer = await nodeFetch(url)
        if (Buffer.status == 200) {
            Buffer = await Buffer.buffer()
            const image = await Jimp.read(Buffer);
            Buffer = await image.resize(256, 256).getBufferAsync(Jimp.MIME_PNG)
            fs.writeFileSync("build/icon.icns", png2icons.createICNS(Buffer, png2icons.BILINEAR, 0));
            fs.writeFileSync("build/icon.ico", png2icons.createICO(Buffer, png2icons.HERMITE, 0, false));
            fs.writeFileSync("build/icon.png", Buffer);
        } else {
            console.log('connection error')
        }
    }
}

process.argv.forEach(val => {
    if (val.startsWith('--icon')) {
        return new Index().iconSet(val.split('=')[1])
    } else if (val.startsWith('--build')) {
        new Index().build()
    }
});