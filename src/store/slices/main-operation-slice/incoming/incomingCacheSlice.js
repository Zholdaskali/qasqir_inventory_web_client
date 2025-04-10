import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  nomenclatures: [],
  warehouses: [],
  zonesByWarehouse: {},
  containersByZone: {},
  suppliers: [],
};

const incomingCacheSlice = createSlice({
  name: 'incomingCache', // Изменено с 'cacheData'
  initialState,
  reducers: {
    setNomenclatures: (state, action) => {
      state.nomenclatures = action.payload;
    },
    setWarehouses: (state, action) => {
      state.warehouses = action.payload;
    },
    setZonesForWarehouse: (state, action) => {
      const { warehouseId, zones } = action.payload;
      state.zonesByWarehouse[warehouseId] = zones;
    },
    setContainersForZone: (state, action) => {
      const { zoneId, containers } = action.payload;
      state.containersByZone[zoneId] = containers;
    },
    setSuppliers: (state, action) => {
      state.suppliers = action.payload;
    },
    resetCache: (state) => {
      state.nomenclatures = [];
      state.warehouses = [];
      state.zonesByWarehouse = {};
      state.containersByZone = {};
      state.suppliers = [];
    },
  },
});

export const {
  setNomenclatures,
  setWarehouses,
  setZonesForWarehouse,
  setContainersForZone,
  setSuppliers,
  resetCache,
} = incomingCacheSlice.actions;

export default incomingCacheSlice.reducer;