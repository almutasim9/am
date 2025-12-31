import React, { useContext } from 'react';
import useTranslation from '../../../hooks/useTranslation';
import { DataContext } from '../../../contexts/DataContext';
import { ToastContext } from '../../../contexts/AppContext';
import { db } from '../../../services/db';
import Modal from '../../common/Modal';
import VisitForm from './VisitForm';

const NewVisitDialog = ({ isOpen, onClose, preselectedStoreId }) => {
    const t = useTranslation();
    const { stores, settings, refreshData } = useContext(DataContext);
    const { showToast } = useContext(ToastContext);

    const handleSave = async (visitData) => {
        try {
            const table = await db.from('visits');
            await table.insert({ ...visitData, store_id: preselectedStoreId || visitData.store_id });

            showToast(t('savedSuccess'), 'success');
            refreshData();
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Error saving visit', 'error');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('newVisit')}>
            <VisitForm
                visit={{
                    store_id: preselectedStoreId || '',
                    date: '',
                    type: 'Visit',
                    reason: '',
                    note: '',
                    status: 'scheduled',
                    is_effective: null
                }}
                stores={stores}
                settings={settings}
                onSave={handleSave}
                onCancel={onClose}
            />
        </Modal>
    );
};

export default NewVisitDialog;
