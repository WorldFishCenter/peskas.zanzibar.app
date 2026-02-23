"use client";

import React, { useContext, useState } from "react";
import Cookies from "js-cookie";

export type BmuType = {
  sectionName: string;
  units: {
    value: string;
  }[];
};

const initialData = {
  bmuFilter: [] as string[],
  setBmuFilter: () => {},
  bmuOriginalData: [] as BmuType[],
};

const GlobalFilterContext = React.createContext<{
  bmuFilter: string[];
  setBmuFilter: (data: string[]) => void;
  bmuOriginalData: BmuType[];
}>(initialData);

export const GlobalFilterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // bmuOriginalData will be populated via a real API call when wired in.
  const [bmuOriginalData] = useState<BmuType[]>([]);
  const [bmuFilter, setBmuFilter] = useState([] as string[]);

  const setFilter = (data: string[]) => {
    const filterData = data.filter(function (item, pos) {
      return data.indexOf(item) === pos;
    });
    setBmuFilter(filterData);
    Cookies.set("bmuFilter", JSON.stringify(filterData));
  };

  return (
    <GlobalFilterContext.Provider
      value={{ bmuFilter, setBmuFilter: setFilter, bmuOriginalData }}
    >
      {children}
    </GlobalFilterContext.Provider>
  );
};

export const useGlobalFilter = () => {
  return useContext(GlobalFilterContext);
};
