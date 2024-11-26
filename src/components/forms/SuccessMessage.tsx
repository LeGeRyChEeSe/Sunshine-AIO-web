export default function SuccessMessage() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Thank you!
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        Your message has been sent successfully.
      </p>
    </div>
  );
}