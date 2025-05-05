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

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    imports: <PiHouseLineDuotone />,
    rules: <PiAddressBookDuotone/> ,
    requests: <PiStackDuotone/> ,
    dashboard: <PiDiceFourDuotone/> ,
    scans: <PiScanDuotone/> ,
    // singleMenu: <PiAcornDuotone />,
    // collapseMenu: <PiArrowsInDuotone />,
    // groupSingleMenu: <PiBookOpenUserDuotone />,
    // groupCollapseMenu: <PiBookBookmarkDuotone />,
    // groupMenu: <PiBagSimpleDuotone />
}

export default navigationIcon
