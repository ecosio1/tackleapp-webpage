/**
 * State regulation links configuration
 * These are outbound links to official state resources
 */

export interface StateRegulationLink {
  label: string;
  url: string;
  description?: string;
}

export const STATE_REGULATION_LINKS: Record<string, StateRegulationLink> = {
  FL: {
    label: 'Florida Fish and Wildlife Conservation Commission',
    url: 'https://myfwc.com/fishing/saltwater/',
    description: 'Official Florida saltwater fishing regulations',
  },
  TX: {
    label: 'Texas Parks and Wildlife Department',
    url: 'https://tpwd.texas.gov/regulations/outdoor-annual/fishing/',
    description: 'Official Texas fishing regulations',
  },
  CA: {
    label: 'California Department of Fish and Wildlife',
    url: 'https://wildlife.ca.gov/Fishing',
    description: 'Official California fishing regulations',
  },
  NY: {
    label: 'New York State Department of Environmental Conservation',
    url: 'https://www.dec.ny.gov/outdoor/fishing.html',
    description: 'Official New York fishing regulations',
  },
  LA: {
    label: 'Louisiana Department of Wildlife and Fisheries',
    url: 'https://www.wlf.louisiana.gov/page/fishing',
    description: 'Official Louisiana fishing regulations',
  },
  NC: {
    label: 'North Carolina Division of Marine Fisheries',
    url: 'https://www.deq.nc.gov/about/divisions/marine-fisheries',
    description: 'Official North Carolina fishing regulations',
  },
  SC: {
    label: 'South Carolina Department of Natural Resources',
    url: 'https://www.dnr.sc.gov/fish.html',
    description: 'Official South Carolina fishing regulations',
  },
  GA: {
    label: 'Georgia Department of Natural Resources',
    url: 'https://gadnr.org/fishing',
    description: 'Official Georgia fishing regulations',
  },
  AL: {
    label: 'Alabama Department of Conservation and Natural Resources',
    url: 'https://www.outdooralabama.com/fishing',
    description: 'Official Alabama fishing regulations',
  },
  MS: {
    label: 'Mississippi Department of Marine Resources',
    url: 'https://dmr.ms.gov/fishing/',
    description: 'Official Mississippi fishing regulations',
  },
};



