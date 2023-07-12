import { Disclosure } from "@headlessui/react";
import { ChevronDoubleDownIcon, XIcon } from "@heroicons/react/outline";

// const navigationPayroll = [
//   {
//     name: "2019",
//     url: "https://2019arrests.lacontroller.io/",
//     newtab: true,
//   },
//   {
//     name: "2020",
//     url: "https://2020arrests.lacontroller.io/",
//     newtab: true,
//   },
//   {
//     name: "2021",
//     url: "/",
//   },
//   {
//     name: "2022",
//     url: "https://2022arrests.lacontroller.io/",
//     newtab: true,
//   },
//   {
//     name: "Table",
//     url: "https://docs.google.com/spreadsheets/d/1-LzMD1fz8ZqaEmdEus2qhgcWSCZyCz4LTE5B1I7HWoI/edit?usp=sharing",
//     newtab: true,
//   },
//   {
//     name: "LA Controller",
//     url: "https://controller.lacity.gov",
//     newtab: true,
//   },
// ];

interface newiteminterface {
  name: string;
  href: string;
  target: string;
  current: boolean;
}

const navigation: any = [
  {
    name: "LA Controller",
    href: "https://controller.lacity.gov",
    target: "_blank",
  },
  {
    name: "2019",
    href: "https://2019arrests.lacontroller.io/",
    target: "_blank",
  },
  {
    name: "2020",
    href: "https://2020arrests.lacontroller.io/",
    target: "_blank",
  },
  {
    name: "2021",
    href: "/",
    target: "_self",
  },
  { name: "2022", href: "https://2022arrests.lacontroller.io/", target: "_blank" },
  {
    name: "41.18",
    href: "https://4118arrests.lacontroller.io/",
    target: "_blank",
  },
  {
    name: "Table",
    href: "https://docs.google.com/spreadsheets/d/1-LzMD1fz8ZqaEmdEus2qhgcWSCZyCz4LTE5B1I7HWoI/edit?usp=sharing",
    target: "_blank",
  },
  {
    name: "Analysis",
    href: "https://controller.lacity.gov/landings/arrests",
    target: "_blank",
  },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

function Nav() {
  const navarraycurrent = () => {
    return navigation.map((item: any) => {
      if (typeof window !== "undefined") {
        if (item.href === window.location.pathname) {
          item["current"] = true;
        } else {
          item["current"] = false;
        }
      } else {
        item["current"] = false;
      }

      return item;
    });
  };

  const messageBox = () => {
    alert(
      "-Select the Year you want to view by clicking on the year at the top left of the map.\n\n-Once a year is selected, the map can be filtered by Race, Council District, Los Angeles Police Dept (LAPD) Division, and Arrest Type. (Borders within the map represent Council Districts.)\n\n-Click the Filter button on the left side of the map to open the Filter window, and set the filters as desired.\n\n-Drag the map to navigate map locations. Use the zoom buttons on the right (or drag 2 fingers if on mobile) to zoom in and out.\n\n-Hover over hotspots to instantly see details for up to 3 cases per location.\n\n-Click on hotspots to see additional cases per location in a new pop-up window within the map. This window will remain open until you click on another location. (Note: If you are zoomed out, hotspots may blend together. Zoom all the way in to see individual hotspots.)\n\n-Click Analysis above to read our findings on the map data."
    );
  };

  return (
    // <div className="z-50 bg-[#1a1a1a] flex flex-col">
    //   <nav className="z-50 flex flex-row  h-content">
    //     {navigationPayroll.map((item: any, itemIdx: any) => (
    //       <ActiveLink
    //         activeClassName="text-white py-2 md:py-3 px-3 block hover:text-green-300 focus:outline-none text-green-300 border-b-2 font-medium border-green-300"
    //         href={item.url}
    //         key={itemIdx}
    //         target={`${item.newtab === true ? "_blank" : ""}`}
    //       >
    //         <p className="text-white py-2 text-sm md:text-base md:py-3 px-3 block hover:text-green-300 focus:outline-none underline">
    //           {item.name}
    //         </p>
    //       </ActiveLink>
    //     ))}
    //   </nav>
    // </div>
    <Disclosure as="nav" className="z-50 bg-[#1a1a1a] flex flex-col">
    {({ open }) => (
      <>
        <div className="z-50 flex flex-row  h-content">
          <div className="">
            {/* Mobile menu button*/}
            <div className="flex flex-row sm:hidden">
              <div className="inset-y-0 left-0">
                <Disclosure.Button className=" rounded-md p-2 hover:bg-[#80ffdc] focus:outline-none bg-[#1a1a1a] text-white hover:text-gray-100">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <ChevronDoubleDownIcon
                      className="block h-6 w-6"
                      aria-hidden="true"
                    />
                  )}
                </Disclosure.Button>
              </div>
              <div className="grid content-center ml-2">
                <strong className="text-white">LAPD Arrests 2022</strong>
              </div>
            </div>
            <div className="hidden sm:ml-4 sm:block lg:ml-6">
              <div className="flex gap-x-3 lg:gap-x-4">
                {navarraycurrent().map((item: newiteminterface) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target={item.target}
                    className={classNames(
                      item.current
                        ? "py-2 md:py-3 px-3 block hover:text-green-300 focus:outline-none text-green-300 border-b-2 font-medium border-green-300"
                        : "text-white py-2 text-sm md:text-base md:py-3 px-3 block hover:text-green-300 focus:outline-none underline"
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </a>
                ))}
                <p
                  className="text-white py-2 text-sm md:text-base   md:py-3 px-3 block hover:text-green-300 focus:outline-none underline"
                  onClick={messageBox}
                >
                  Instructions
                </p>
              </div>
            </div>
          </div>
        </div>

        <Disclosure.Panel className="md:hidden">
          <div className="space-y-1 px-2 pt-3 pb-3">
            {navarraycurrent().map((item: newiteminterface) => (
              <Disclosure.Button
                key={item.name}
                as="a"
                href={item.href}
                target={item.target}
                className={classNames(
                  item.current ? "bg-green-900 text-white" : "text-gray-100",
                  "block rounded-md px-3 py-2 text-base font-medium"
                )}
                aria-current={item.current ? "page" : undefined}
              >
                {item.name}
              </Disclosure.Button>
            ))}
            <p
              className="text-white font-medium text-base py-2 md:text-base md:py-3 px-3 block focus:outline-none"
              onClick={messageBox}
            >
              Instructions
            </p>
          </div>
        </Disclosure.Panel>
      </>
    )}
  </Disclosure>
  );
}

export default Nav;
