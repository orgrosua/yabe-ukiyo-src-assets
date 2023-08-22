/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core';

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

/* import specific icons */
import {
    faSunBright,
    faMoonStars,
    faChevronRight,
    faCircleNotch,
    faBook,
    faUserHeadset,
    faRss,
    faGear,
    faGripDotsVertical,
    faTrash,
    faX,
    faPlus,
    faUpRightFromSquare,
    faMagnifyingGlass,
    faSpinner,
    faEye,
    faEyeSlash,
    faShuffle,
    faCheck,
    faXmark,
    faInfinity,
} from '@fortawesome/pro-solid-svg-icons';

import {
    faHeart as faHeartRegular,
    faChevronRight as faChevronRightRegular,
    faLaptopMobile as faLaptopMobileRegular,
    faPalette as faPaletteRegular,
    faArrowsLeftRightToLine as faArrowsLeftRightToLineRegular,
    faTextSize as faTextSizeRegular,
    faBoxArchive as faBoxArchiveRegular,
    faArrowsRotate as faArrowsRotateRegular,
    faClipboard as faClipboardRegular,
} from '@fortawesome/pro-regular-svg-icons';

/* add icons to the library */
library.add(
    /** fas */
    faSunBright,
    faMoonStars,
    faChevronRight,
    faCircleNotch,
    faBook,
    faUserHeadset,
    faRss,
    faGear,
    faGripDotsVertical,
    faTrash,
    faX,
    faPlus,
    faUpRightFromSquare,
    faMagnifyingGlass,
    faSpinner,
    faEye,
    faEyeSlash,
    faShuffle,
    faCheck,
    faXmark,
    faInfinity,

    /** far */
    faHeartRegular,
    faChevronRightRegular,
    faLaptopMobileRegular,
    faPaletteRegular,
    faArrowsLeftRightToLineRegular,
    faTextSizeRegular,
    faBoxArchiveRegular,
    faArrowsRotateRegular,
    faClipboardRegular,
);

export { library, FontAwesomeIcon };