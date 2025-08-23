const WorkloadModal = ({ visible, teacher }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {teacher.name}
          </h3>
        </div>
      </div>
    </div>
  );
};
export default WorkloadModal;
