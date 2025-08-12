import React, { useMemo, useState } from "react";

import { DataContext } from "./DataContext";

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const value = useMemo(() => ({ data, setData }), [data]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
