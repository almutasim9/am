import { useContext } from 'react';
import { LangContext } from '../contexts/AppContext';
import { translations } from '../utils/translations';

const useTranslation = () => {
    const { lang } = useContext(LangContext);
    return (key) => translations[lang]?.[key] || key;
};

export default useTranslation;
