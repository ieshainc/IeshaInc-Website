export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-300 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="text-xl font-bold text-indigo-600">YourSite</div>
            <p className="text-sm text-gray-600 mt-1">Your business slogan here</p>
          </div>
          
          <div className="text-sm text-gray-500">
            &copy; {currentYear} YourSite. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
} 