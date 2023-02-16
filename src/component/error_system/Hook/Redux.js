import { useSelector } from 'react-redux';

export function useLoadingErrorSystem() {
    const isLoadingErrorSystem = useSelector(state => state.errorSystem.isLoadingErrorSystem)
    return { isLoadingErrorSystem }
}
