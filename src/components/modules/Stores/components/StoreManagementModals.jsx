import React from 'react';
import Modal from '../../../common/Modal';
import ConfirmModal from '../../../common/ConfirmModal';
import StoreForm from '../StoreForm';
import StoresImportModal from './StoresImportModal';
import useTranslation from '../../../../hooks/useTranslation';

const StoreManagementModals = ({
    showModal, setShowModal,
    showImportModal, setShowImportModal,
    confirmDelete, setConfirmDelete,
    confirmBulkDelete, setConfirmBulkDelete,
    editStore, setEditStore,
    settings,
    handleSave,
    handleDeleteConfirm,
    handleBulkDelete,
    handleImportConfirm,
    importData,
    downloadTemplate,
    selectedIds
}) => {
    const t = useTranslation();

    return (
        <>
            {/* Store Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditStore(null); }}
                title={editStore ? t('edit') : t('addStore')}
            >
                <StoreForm
                    store={editStore}
                    settings={settings}
                    onSave={handleSave}
                    onCancel={() => setShowModal(false)}
                />
            </Modal>

            {/* Import Modal */}
            <Modal
                isOpen={showImportModal}
                onClose={() => { setShowImportModal(false); }}
                title={t('importStores')}
            >
                <StoresImportModal
                    importData={importData}
                    onConfirm={handleImportConfirm}
                    onDownloadTemplate={downloadTemplate}
                />
            </Modal>

            {/* Single Delete Confirm */}
            <ConfirmModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDeleteConfirm}
                title={t('confirmDelete')}
                message={t('confirmDeleteMessage')}
            />

            {/* Bulk Delete Confirm */}
            <ConfirmModal
                isOpen={confirmBulkDelete}
                onClose={() => setConfirmBulkDelete(false)}
                onConfirm={handleBulkDelete}
                title="Bulk Delete"
                message={`Are you sure you want to delete ${selectedIds.length} stores? This action cannot be undone.`}
            />
        </>
    );
};

export default StoreManagementModals;
