import { useState } from "react";

const starterPrompts = [
  "Which products are low stock right now?",
  "What sold most in the last 30 days?",
  "Summarize dispatch vs returns this week."
];

const formatActionType = (type) =>
  ({
    create_dispatch: "Dispatch stock",
    add_return: "Add return",
    reset_stock: "Reset stock",
    create_product: "Create product"
  })[type] || "Inventory action";

export const AssistantSection = ({ busy, onSend, onExecuteAction }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Ask me about stock, low inventory, sales trends, returns, or admin inventory actions. I will ask for confirmation before changing anything."
    }
  ]);
  const [input, setInput] = useState("");
  const [pendingId, setPendingId] = useState(null);
  const [error, setError] = useState("");

  const sendMessage = async (content) => {
    const trimmedContent = content.trim();

    if (!trimmedContent || busy) {
      return;
    }

    const userMessage = { role: "user", content: trimmedContent };
    const history = [...messages, userMessage]
      .filter((message) => ["user", "assistant"].includes(message.role))
      .map(({ role, content: messageContent }) => ({ role, content: messageContent }))
      .slice(-12);

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");

    try {
      const response = await onSend({ messages: history });
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: response.reply,
          pendingAction: response.pendingAction,
          contextMeta: response.contextMeta
        }
      ]);
    } catch (sendError) {
      setError(sendError.message);
    }
  };

  const executeAction = async (action, messageIndex) => {
    setPendingId(messageIndex);
    setError("");

    try {
      const response = await onExecuteAction(action);
      setMessages((current) =>
        current
          .map((message, index) =>
            index === messageIndex ? { ...message, pendingAction: null } : message
          )
          .concat({
            role: "assistant",
            content: response.message || "Action completed."
          })
      );
    } catch (executeError) {
      setError(executeError.message);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
          AI inventory assistant
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">Ask your stock data</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Analyze live inventory, dispatches, returns, and low stock. Admin actions require a final
          confirmation before anything changes.
        </p>
      </div>

      <div className="grid min-h-[620px] lg:grid-cols-[1fr_320px]">
        <div className="flex min-h-[620px] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[92%] rounded-3xl px-4 py-3 text-sm leading-6 sm:max-w-[78%] ${
                    message.role === "user"
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {message.pendingAction ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-slate-800">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                        Confirmation required
                      </p>
                      <p className="mt-2 font-semibold">
                        {formatActionType(message.pendingAction.type)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{message.pendingAction.summary}</p>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          disabled={pendingId === index}
                          onClick={() => executeAction(message.pendingAction, index)}
                          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {pendingId === index ? "Running..." : "Confirm and run"}
                        </button>
                        <button
                          type="button"
                          disabled={pendingId === index}
                          onClick={() =>
                            setMessages((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, pendingAction: null } : item
                              )
                            )
                          }
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {message.contextMeta ? (
                    <p className="mt-3 text-xs text-slate-400">
                      Checked {message.contextMeta.productsAnalyzed} products and{" "}
                      {message.contextMeta.recentLogsAnalyzed} recent logs.
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {error ? (
            <div className="mx-4 mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6">
              {error}
            </div>
          ) : null}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
            className="border-t border-slate-100 p-4 sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                className="min-h-[56px] flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
                placeholder="Ask about inventory, or say: dispatch 2 units of SKU ABC..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="rounded-3xl bg-teal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Thinking..." : "Send"}
              </button>
            </div>
          </form>
        </div>

        <aside className="border-t border-slate-100 bg-slate-50/80 p-5 lg:border-l lg:border-t-0">
          <h3 className="text-lg font-bold text-slate-900">Try asking</h3>
          <div className="mt-4 space-y-3">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-3xl border border-teal-100 bg-teal-50 p-4">
            <p className="text-sm font-bold text-teal-900">Safe action mode</p>
            <p className="mt-2 text-sm leading-6 text-teal-800">
              The assistant can prepare dispatches, returns, product creation, and stock resets, but
              only an admin confirmation button executes the change.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
};
