import { Main } from "./pages/main/main";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <Main />
        <ReactQueryDevtools />
      </QueryClientProvider>
    </div>
  );
}

export default App;
