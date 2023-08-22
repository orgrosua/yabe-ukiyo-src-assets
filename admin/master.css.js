import { initRuntime } from '@master/css';
// import { ThemeService } from 'theme-service';
import twColors from 'tailwindcss/colors';

/** @type {import('@master/css').Config} */
const config = {
    scope: '#ukiyo-app',
    colors: {
        'tw-slate': twColors.slate,
        'tw-gray': twColors.gray,
        'tw-zinc': twColors.zinc,
        'tw-neutral': twColors.neutral,
        'tw-stone': twColors.stone,
        'tw-red': twColors.red,
    },
    classes: {},
    animations: {
        'tw-pulse': {
            '0%,100%': {
                opacity: 1,
            },
            '50%': {
                opacity: .5,
            }
        }
    },
};

const masterCSS = initRuntime(config);

// const themeService = new ThemeService({
//     store: 'theme'
// });

export {
    config,
    masterCSS,
    // themeService,
};
