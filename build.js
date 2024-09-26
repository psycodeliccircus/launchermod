const builder = require('electron-builder');
const nodeFetch = require('node-fetch');
const fs = require("fs");
const png2icons = require('png2icons');
const Jimp = require('jimp');
const { productName } = require('./package.json');

class Index {
    async build() {
        builder.build({
            config: {
                $schema: "https://raw.githubusercontent.com/electron-userland/electron-builder/master/packages/app-builder-lib/scheme.json",
                appId: 'com.github.psycodeliccircus.launchermod',
                productName: 'Launcher Mods',
                executableName: 'launchermods',
                copyright: "Copyright © 1984-2024 Launcher Mods - Dev by RenildoMarcio",
                //forceCodeSigning: true,
                asar: true,
                files: ["**/*", "package.json", "LICENSE.md"],
                directories: { output: "dist" },
                compression: 'maximum',
                publish: [{
                    provider: "github",
                    releaseType: 'release',
                }],
                mac: {
                    category: "public.app-category.games",
                    icon: "./build/icon.icns",
                    target: [
                        {
                            target: "dmg",
                            arch: ["x64", "arm64"]
                        },
                        {
                            target: "zip",
                            arch: ["x64", "arm64"]
                        }
                    ],
                    entitlements: "build/entitlements.plist",
                    entitlementsInherit: "build/entitlementsInherit.plist",
                    extendInfo: "launchermods"
                },
                win: {
                    icon: "./build/icon.ico",
                    publisherName: "Launcher Mods",
                    target: [
                        {
                            target: "nsis",
                            arch: ["x64"]
                        },
                        {
                            target: "portable",
                            arch: ["x64"]
                        }
                    ]
                },
                linux: {
                    category: "Game",
                    artifactName: "Launcher Mods",
                    desktop: "launchermods.desktop",
                    synopsis: "Sistema Launcher Mods!",
                    description: "Sistema Launcher Mods!",
                    icon: "./build/icon.png",
                    executableName: "launchermods",
                    target: [
                        {
                            target: "AppImage",
                            arch: ["x64"]
                        }
                    ]
                },
                appImage: {
                    artifactName: "Launcher-Mods-${arch}.AppImage",
                    category: "Game",
                    desktop: "./LauncherMods.desktop",
                    license: "./eula.txt"
                },
                deb: {
                    artifactName: "Launcher-Mods_${version}-1_${arch}.deb",
                    category: "Game",
                    desktop: "./LauncherMods.desktop"
                },
                dmg: {
                    artifactName: "Launcher-Mods-${arch}.dmg",
                    title: "Launcher Mods Installer"
                },
                nsis: {
                    license: "./eula.txt",
                    oneClick: false,
                    perMachine: false,
                    allowToChangeInstallationDirectory: true,
                    installerIcon: "./build/icon.ico",
                    uninstallerIcon: "./build/uninstall.ico",
                    createDesktopShortcut: true,
                    createStartMenuShortcut: true
                },
                extraResources: [
                    "build/icon.png"
                ],
                protocols: {
                    name: "launchermod",
                    schemes: [
                        "launchermods",
                        "launchermod"
                    ]
                }
            }
        }).then(() => {
            console.log('A build está concluída');
        }).catch(err => {
            console.error('Erro durante a build!', err);
        });
    }

    async iconSet(url) {
        let response = await nodeFetch(url);
        if (response.status === 200) {
            let buffer = await response.buffer();
            const image = await Jimp.read(buffer);
            buffer = await image.resize(256, 256).getBufferAsync(Jimp.MIME_PNG);
            fs.writeFileSync("build/icon.icns", png2icons.createICNS(buffer, png2icons.BILINEAR, 0));
            fs.writeFileSync("build/icon.ico", png2icons.createICO(buffer, png2icons.HERMITE, 0, false));
            fs.writeFileSync("build/icon.png", buffer);
        } else {
            console.log('Erro de conexão');
        }
    }
}

process.argv.forEach(val => {
    if (val.startsWith('--icon')) {
        new Index().iconSet(val.split('=')[1]);
    } else if (val.startsWith('--build')) {
        new Index().build();
    }
});
