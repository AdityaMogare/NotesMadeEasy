import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router";
import PomodoroTimer from "../components/PomodoroTimer";

const PomodoroPage = () => {
  const productivityTips = [
    "Work in focused 25-minute sessions",
    "Take 5-minute breaks between sessions",
    "After 4 pomodoros, take a longer 15-minute break",
    "Eliminate distractions during work sessions",
    "Use breaks to stretch and move around"
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link to={"/"} className="btn btn-ghost mb-6">
            <ArrowLeftIcon className="size-5" />
            Back to Notes
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pomodoro Timer */}
            <div className="lg:col-span-2">
              <PomodoroTimer />
            </div>

            {/* Productivity Tips */}
            <div className="card bg-base-100 shadow-xl h-fit">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">Productivity Tips</h3>
                <ul className="space-y-3">
                  {productivityTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="divider"></div>
                
                <div className="text-sm text-gray-600">
                  <h4 className="font-semibold mb-2">How it works:</h4>
                  <p className="mb-2">The Pomodoro Technique is a time management method that uses focused work sessions followed by short breaks.</p>
                  <p>This helps maintain concentration and prevents burnout while improving productivity.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroPage; 