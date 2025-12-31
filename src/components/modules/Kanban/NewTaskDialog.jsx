import React, { useContext } from 'react';
import useTranslation from '../../../hooks/useTranslation';
import { DataContext } from '../../../contexts/DataContext';
import { ToastContext } from '../../../contexts/AppContext';
import { db } from '../../../services/db';
import Modal from '../../common/Modal';
import TaskForm from './TaskForm';

const NewTaskDialog = ({ isOpen, onClose, preselectedStoreId }) => {
    const t = useTranslation();
    const { stores, settings, refreshData } = useContext(DataContext);
    const { showToast } = useContext(ToastContext);

    const handleSave = async (taskData) => {
        try {
            const table = await db.from('tasks');
            await table.insert({ ...taskData, store_id: preselectedStoreId || taskData.store_id });

            showToast(t('savedSuccess'), 'success');
            refreshData();
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Error saving task', 'error');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('newTask')}>
            <TaskForm
                task={{
                    store_id: preselectedStoreId || '',
                    cat: '',
                    sub: '',
                    priority: 'medium',
                    due_date: '',
                    description: '',
                    status: 'pending'
                }}
                stores={stores}
                settings={settings}
                onSave={handleSave}
                onCancel={onClose}
            />
        </Modal>
    );
};

export default NewTaskDialog;
