document.addEventListener('alpine:init', () => {
    // Helper function to safely read and parse localStorage data
    function loadFromStorage() {
        try {
            const local = localStorage.getItem('os-theme');
            return local ? JSON.parse(local) : null;
        } catch (e) {
            console.error('Failed to parse localStorage:', e);
            return null;
        }
    }

    // Fetch initial state data synchronously before registering the store
    let savedData = loadFromStorage();

    Alpine.store('os', {
        menuOpen: false,
        theme: savedData?.theme || 'ios',
        palette: savedData?.palette || 'hard', 
        accentIndex: savedData?.accent !== undefined ? savedData.accent : 2, // Defaults to 2 (Orange)
        darkMode: savedData?.darkMode !== undefined ? savedData.darkMode : false,
        
        get colors() {
            return [1, 2, 3, 4, 5, 6, 7, 8];
        },
        
        init() {
            // Apply variables directly to :root during startup
            this.updateRootPalette();
            
            // Watch store state changes and save automatically via reactive effects
            Alpine.effect(() => {
                this.updateRootPalette();
                try {
                    const data = {
                        theme: this.theme,
                        palette: this.palette,
                        accent: this.accentIndex,
                        darkMode: this.darkMode
                    };
                    localStorage.setItem('os-theme', JSON.stringify(data));
                } catch (e) {
                    console.error('Failed to save theme:', e);
                }
            });

            // Centralized function to synchronize the active store state with localStorage changes
            const syncStoreWithStorage = () => {
                const freshData = loadFromStorage();
                if (freshData) {
                    if (freshData.theme !== undefined && freshData.theme !== this.theme) this.theme = freshData.theme;
                    if (freshData.palette !== undefined && freshData.palette !== this.palette) this.palette = freshData.palette;
                    if (freshData.accent !== undefined && freshData.accent !== this.accentIndex) this.accentIndex = freshData.accent;
                    if (freshData.darkMode !== undefined && freshData.darkMode !== this.darkMode) this.darkMode = freshData.darkMode;
                    this.updateRootPalette();
                }
            };

            // Triggers when returning from standard anchor links or mobile page history (bfcache)
            window.addEventListener('pageshow', (event) => {
                syncStoreWithStorage();
            });
        },

        updateRootPalette() {
            const hues = { 1: 20, 2: 55, 3: 100, 4: 145, 5: 190, 6: 240, 7: 290, 8: 325 };
            const configs_palette = { 
                hard: { l: 62, c: 0.18 }, 
                pastel: { l: 65, c: 0.09 }, 
                muted: { l: 52, c: 0.06 } 
            };
            
            const hue = hues[this.accentIndex] || 55;
            const pal = configs_palette[this.palette] || configs_palette.hard;
            const { l, c: chroma } = pal;
            const paletteSource = `oklch(${l}% ${chroma} ${hue})`;
            
            if (document.documentElement) {
                document.documentElement.style.setProperty('--color-8', paletteSource);
            }
        },

        getStyles() {
            const hues = { 1: 20, 2: 55, 3: 100, 4: 145, 5: 190, 6: 240, 7: 290, 8: 325 };
            const configs_palette = { 
                hard: { l: 62, c: 0.18 }, 
                pastel: { l: 65, c: 0.09 }, 
                muted: { l: 52, c: 0.06 } 
            };
            
            const hue = hues[this.accentIndex] || 55;
            const pal = configs_palette[this.palette] || configs_palette.hard;
            const { l, c: chroma } = pal;

            const paletteSource = `oklch(${l}% ${chroma} ${hue})`;
            const borderNeutral = 'light-dark(var(--gray-4), var(--gray-12))';
            const shadowNeutral = 'var(--shadow-3)';

            const configs = {
                ios: { font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', radius: '16px', buttonRadius: '999px', borderWidth: '0.8px', borderColor: borderNeutral, outlineColor: borderNeutral, shadow: shadowNeutral },
                windows: { font: '"Segoe UI", Tahoma, sans-serif', radius: '2px', borderWidth: '2.33px', borderColor: borderNeutral, outlineColor: 'var(--surface-tonal)', shadow: 'none' },
                gnome: { font: 'Cantarell, sans-serif', radius: '12px', borderWidth: '1.5px', borderColor: borderNeutral, outlineColor: borderNeutral, shadow: 'var(--shadow-2)' },
                breeze: { font: 'Oxygen, sans-serif', radius: '4px', borderWidth: '1.5px', borderColor: 'var(--color-8)', outlineColor: 'var(--color-8)', shadow: 'var(--shadow-1)' },
                slate: { font: 'monospace', fontSize: '0.9rem', radius: '4px', borderWidth: '1px', borderColor: borderNeutral, outlineColor: borderNeutral, shadow: 'var(--shadow-2)' }
            };
            
            const conf = configs[this.theme] || configs.slate;
            
            return {
                '--font-sans': conf.font,
                '--font-size-base': conf.fontSize || 'inherit',
                '--border-radius': conf.radius,
                '--button-border-radius': conf.buttonRadius || conf.radius,
                '--field-border-radius': conf.radius,
                '--os-outline-color': conf.outlineColor,
                '--border-width': conf.borderWidth,
                '--os-border': `${conf.borderWidth} solid ${conf.borderColor}`,
                '--os-shadow': conf.shadow,
                '--os-radius': conf.radius,
                
                '--palette-source': paletteSource,
                '--palette-hue': hue,
                '--palette-chroma': chroma,
                
                '--os-accent': 'var(--color-8)', 
                '--primary': 'var(--color-8)', 
                '--surface-filled': 'var(--color-8)', 
                
                '--color-series-1': `oklch(71% ${chroma} 240)`, 
                '--color-series-2': `oklch(71% ${chroma} 325)`, 
                '--color-series-3': `oklch(71% ${chroma} 145)`, 
                '--color-series-4': `oklch(71% ${chroma} 55)`,  
                
                '--swatch-1': `oklch(${l}% ${chroma} 20)`,
                '--swatch-2': `oklch(${l}% ${chroma} 55)`,
                '--swatch-3': `oklch(${l}% ${chroma} 100)`,
                '--swatch-4': `oklch(${l}% ${chroma} 145)`,
                '--swatch-5': `oklch(${l}% ${chroma} 190)`,
                '--swatch-6': `oklch(${l}% ${chroma} 240)`,
                '--swatch-7': `oklch(${l}% ${chroma} 290)`,
                '--swatch-8': `oklch(${l}% ${chroma} 325)`
            };
        }
    });
});
