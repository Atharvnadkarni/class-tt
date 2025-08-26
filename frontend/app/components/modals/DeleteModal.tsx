import { X, Save } from "lucide-react";

const DeleteModal = ({ setIsModalOpen, deleteAction }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Delete Warning
          </h3>
          <button
            onClick={() => setIsModalOpen(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 pt-1 pb-1 space-y-1">
          {/* Period and Time Info */}
          <p>Are you sure you want to delete this?</p>
          {/* Subject Input */}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-gray-200">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              deleteAction();
              setIsModalOpen(null);
            }}
            className="px-4 py-2 text-sm font-medium  bg-secondary text-black hover:bg-secondary text-black rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
export default DeleteModal;
