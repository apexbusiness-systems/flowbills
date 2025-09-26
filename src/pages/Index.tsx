import React from "react";

const Index = () => {
  return (
    <main className="min-h-screen grid place-items-center">
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center space-y-3 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Never miss a call. Work while you sleep.
          </h1>
          <p className="text-lg text-muted-foreground">Help us help you.</p>
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl shadow-lg p-6 bg-white dark:bg-neutral-900">
            <h2 className="text-xl font-semibold mb-4">Start Trial</h2>
            <p className="text-muted-foreground">Begin your journey with FlowBills.</p>
          </div>
          <div className="rounded-2xl shadow-lg p-6 bg-white dark:bg-neutral-900">
            <h2 className="text-xl font-semibold mb-4">ROI Calculator</h2>
            <p className="text-muted-foreground">Calculate your return on investment.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;