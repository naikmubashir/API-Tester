import {
    PiHouseLineDuotone,
    PiArrowsInDuotone,
    PiBookOpenUserDuotone,
    PiBookBookmarkDuotone,
    PiAcornDuotone,
    PiBagSimpleDuotone,
    PiAddressBookDuotone,
    PiStackDuotone,
    PiDiceFourDuotone,
    PiScanDuotone,
} from 'react-icons/pi'
import { CiImport } from "react-icons/ci";

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    imports: <CiImport />,
    rules: <PiAddressBookDuotone/> ,
    requests: <PiStackDuotone/> ,
    dashboard: <PiDiceFourDuotone/> ,
    scans: <PiScanDuotone/> ,
    // home: <PiHouseLineDuotone />,
    // singleMenu: <PiAcornDuotone />,
    // collapseMenu: <PiArrowsInDuotone />,
    // groupSingleMenu: <PiBookOpenUserDuotone />,
    // groupCollapseMenu: <PiBookBookmarkDuotone />,
    // groupMenu: <PiBagSimpleDuotone />
}

export default navigationIcon
