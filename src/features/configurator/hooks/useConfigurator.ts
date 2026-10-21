import { useState, useMemo, useCallback } from 'react';
import { ConfiguratorState, TabType, ShankOption, MetalOption, ShapeOption, CrownOption, GemstoneOption, CaratOption, EternityBandOption } from '../types/configurator.types';
import { INITIAL_CONFIGURATOR_STATE } from '../data/configuration-options';
import { calculateConfiguratorPrice, formatPrice } from '../lib/pricing';

export function useConfigurator(initialState: ConfiguratorState = INITIAL_CONFIGURATOR_STATE) {
  const [state, setState] = useState<ConfiguratorState>(initialState);

  const price = useMemo(() => calculateConfiguratorPrice(state), [
    state.selectedMetal,
    state.selectedCarat,
    state.selectedQuality,
    state.selectedOrigin,
    state.eternityActive,
    state.selectedEternity,
  ]);

  const formattedPrice = useMemo(() => formatPrice(price), [price]);

  const updateState = useCallback((updates: Partial<ConfiguratorState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
      isLoading: true,
    }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, isLoading: false }));
    }, 400);
  }, []);

  const setTab = useCallback((activeTab: TabType) => {
    updateState({ activeTab });
  }, [updateState]);

  const setShank = useCallback((selectedShank: ShankOption) => {
    updateState({ selectedShank });
  }, [updateState]);

  const setMetal = useCallback((selectedMetal: MetalOption) => {
    updateState({ selectedMetal });
  }, [updateState]);

  const setShape = useCallback((selectedShape: ShapeOption) => {
    updateState({ selectedShape });
  }, [updateState]);

  const setCrown = useCallback((selectedCrown: CrownOption) => {
    updateState({ selectedCrown });
  }, [updateState]);

  const setCenterstone = useCallback((selectedCenterstone: GemstoneOption) => {
    updateState({ selectedCenterstone });
  }, [updateState]);

  const setSideDiamond = useCallback((selectedSideDiamond: GemstoneOption) => {
    updateState({ selectedSideDiamond });
  }, [updateState]);

  const setCarat = useCallback((selectedCarat: CaratOption) => {
    updateState({ selectedCarat });
  }, [updateState]);

  const setQuality = useCallback((selectedQuality: string) => {
    updateState({ selectedQuality });
  }, [updateState]);

  const setOrigin = useCallback((selectedOrigin: string) => {
    updateState({ selectedOrigin });
  }, [updateState]);

  const setRingSize = useCallback((selectedRingSize: string) => {
    updateState({ selectedRingSize });
  }, [updateState]);

  const setEternityActive = useCallback((eternityActive: boolean) => {
    updateState({ eternityActive });
  }, [updateState]);

  const setEternity = useCallback((selectedEternity: EternityBandOption) => {
    updateState({ selectedEternity });
  }, [updateState]);

  const toggleFullscreen = useCallback(() => {
    setState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  const openEnquiry = useCallback(() => {
    setState((prev) => ({ ...prev, isEnquiryOpen: true }));
  }, []);

  const closeEnquiry = useCallback(() => {
    setState((prev) => ({ ...prev, isEnquiryOpen: false }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setState(INITIAL_CONFIGURATOR_STATE);
  }, []);

  return {
    state,
    price,
    formattedPrice,
    updateState,
    setTab,
    setShank,
    setMetal,
    setShape,
    setCrown,
    setCenterstone,
    setSideDiamond,
    setCarat,
    setQuality,
    setOrigin,
    setRingSize,
    setEternityActive,
    setEternity,
    toggleFullscreen,
    openEnquiry,
    closeEnquiry,
    resetToDefaults,
  };
}
