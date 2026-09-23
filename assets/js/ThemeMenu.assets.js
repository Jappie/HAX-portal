document.addEventListener('alpine:init', () => {
    // Migrate the old single-blob "os-theme" key to the per-setting keys used
    // by $persist; runs once before the store registers.
    try {
        const blob = JSON.parse(localStorage.getItem('os-theme')) || {};
        if (typeof blob === 'object' && blob !== null && !Array.isArray(blob)) {
            if (blob.theme !== undefined && localStorage.getItem('os-palette') === null) localStorage.setItem('os-palette', JSON.stringify(blob.palette ?? 'hard'));
            if (blob.accent !== undefined && localStorage.getItem('os-accent') === null) localStorage.setItem('os-accent', JSON.stringify(blob.accent));
            if (blob.darkMode !== undefined && localStorage.getItem('os-darkMode') === null) localStorage.setItem('os-darkMode', JSON.stringify(blob.darkMode));
            if (blob.theme !== undefined && typeof blob.theme === 'string') localStorage.setItem('os-theme', JSON.stringify(blob.theme));
            else if (blob.theme !== undefined) localStorage.removeItem('os-theme');
        }
    } catch (e) {
        try { localStorage.removeItem('os-theme'); } catch (e2) {}
    }

    Alpine.store('os', {
        menuOpen: false,
        theme: Alpine.$persist('ios').as('os-theme'),
        palette: Alpine.$persist('hard').as('os-palette'),
        accentIndex: Alpine.$persist(2).as('os-accent'),
        darkMode: Alpine.$persist(false).as('os-darkMode'),
        
        get colors() {
            return [1, 2, 3, 4, 5, 6, 7, 8];
        },
        
        init() {
            // Apply variables directly to :root during startup
            this.updateRootPalette();
            
            // Re-apply when persisted settings change
            Alpine.effect(() => {
                this.updateRootPalette();
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
