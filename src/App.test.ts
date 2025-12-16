import { render, screen, fireEvent, waitFor, within } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App.svelte";
import userEvent from "@testing-library/user-event";
import * as helpers from "./lib/utils/helpers";
import { steps } from "./lib/utils/stateMachine";

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Mock verifyUser helper
vi.mock("./lib/utils/helpers", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        verifyUser: vi.fn(),
    };
});

// Mock foxentry
vi.mock("./lib/foxentry", () => {
    return {
        validateEmail: vi.fn().mockImplementation((email) => Promise.resolve({ isValid: true, normalized: email })),
        validatePhone: vi.fn().mockImplementation((phone) => Promise.resolve({ isValid: true, normalized: phone })),
        validateName: vi.fn().mockImplementation((name) => Promise.resolve({ isValid: true, normalized: name })),
        validateLocation: vi.fn().mockImplementation(() => Promise.resolve({ isValid: true, location: { city: "Praha", street: "Hlavní", streetNumber: "123", postalCode: "11000" } })),
        validateCompany: vi.fn().mockResolvedValue({ isValid: true }),
        searchLocations: vi.fn().mockResolvedValue({ items: [] }),
        searchCompanies: vi.fn().mockResolvedValue([]),
        debounce: (fn: any) => fn
    };
});

vi.mock("svelte/transition", () => ({
    fade: () => ({ duration: 0 }),
    slide: () => ({ duration: 0 }),
}));

describe("Registration App", () => {

    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();

        // Default URL search params reset
        Object.defineProperty(window, "location", {
            value: {
                search: "",
                replace: vi.fn(),
                href: "http://localhost:3000",
                origin: "http://localhost:3000",
                hostname: "localhost"
            },
            writable: true,
        });

        // Default fetch mock implementation - handle all possible fetches here
        fetchMock.mockImplementation((url) => {
            const u = String(url);
            if (u.includes('cities')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ["Praha"]
                });
            }
            if (u.includes('countries')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [{ "CZ": "Česká republika" }]
                });
            }
            if (u.includes('insurance')) {
                // hypothetically if we fetched insurance options
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ "VZP": "Všeobecná zdravotní pojišťovna" })
                });
            }

            // Default empty JSON
            return Promise.resolve({
                ok: true,
                json: async () => []
            });
        });
    });

    const fillStep = async (user: any, container: HTMLElement, stepName: keyof typeof steps, data: Record<string, any>) => {
        const fieldNames = steps[stepName];
        for (const name of fieldNames) {
            if (!data[name]) continue;

            const input = container.querySelector(`[name="${name}"]`);
            if (!input) {
                // Optional fields in stateMachine might not be rendered based on conditions
                // logs might be too noisy if normal.
                continue;
            }

            if (input.tagName === "GT-SELECT" || input.tagName === "SELECT") {
                await user.selectOptions(input, data[name]);
            } else if (input.getAttribute("type") === "radio") {
                const radioValue = data[name];
                const specificRadio = container.querySelector(`[name="${name}"][value="${radioValue}"]`);
                if (specificRadio) await user.click(specificRadio);
            } else {
                await user.clear(input);
                await user.type(input, data[name]);
            }
        }
    };

    describe("Phase 1", () => {
        it("should complete the happy path (Steps 1-4 -> Submit)", async () => {
            const user = userEvent.setup();
            const { container } = render(App);

            // Step 1: Personal Data
            await fillStep(user, container, "step1", {
                firstName: "Jan",
                lastName: "Novák",
                phone: "600123456",
                email: "jan.novak@example.com"
            });

            // Click Next
            const nextButton = screen.getByRole("button", { name: /další|pokračovat/i });
            await user.click(nextButton);

            // Step 2: Address
            await waitFor(() => expect(screen.getByText(/Vaše adresa/i)).toBeInTheDocument());

            await fillStep(user, container, "step2", {
                street: "Hlavní",
                houseNumber: "123",
                city: "Praha",
                zip: "11000",
                deliveryCity: "Praha"
            });

            // Click Next
            await user.click(nextButton);

            // Step 3: Citizenship
            await waitFor(() => expect(screen.getAllByText(/Občanství/i)[0]).toBeInTheDocument());

            await fillStep(user, container, "step3", {
                country: "CZ",
                nationalId: "900101/0007"
            });

            // Click Next
            await user.click(nextButton);

            // Step 4: Bank & Insurance
            await waitFor(() => expect(screen.getByText(/Údaje pro výplatu/i)).toBeInTheDocument());

            await fillStep(user, container, "step4", {
                bankPrefix: "000000",
                bankNumber: "1234567890",
                bankCode: "0800",
                insurance: "VZP",
            });

            // Submit
            const submitButton = screen.getByRole("button", { name: /odeslat/i });
            await user.click(submitButton);

            // Verify Submission
            await waitFor(() => {
                const calls = fetchMock.mock.calls;
                const submissionCall = calls.find(call => call[1] && call[1].method === 'POST');
                expect(submissionCall).toBeDefined();

                if (submissionCall) {
                    const formData = submissionCall[1].body as FormData;
                    expect(formData.get("firstName")).toBe("Jan");
                }
            });
        }, 20000);

        it("should prevent proceeding if validation fails", async () => {
            const user = userEvent.setup();
            const { container } = render(App);

            const nextButton = screen.getByRole("button", { name: /další|pokračovat/i });
            await user.click(nextButton);

            await waitFor(() => {
                // Still on step 1
                expect(container.querySelector('[name="firstName"]')).toBeInTheDocument();
            });
        });
    });

    describe("Phase 2", () => {
        it("should show error if no courierId is present", async () => {
            Object.defineProperty(window, "location", {
                value: {
                    search: "?phase=2",
                    replace: vi.fn(),
                    href: "http://localhost:3000",
                    origin: "http://localhost:3000",
                    hostname: "localhost"
                },
                writable: true,
            });

            render(App);
            await waitFor(() => {
                expect(screen.getByText(/při načítání formuláře se něco pokazilo/i)).toBeInTheDocument();
            });
        });

        it("should verify successfully and show Phase 2 form", async () => {
            (helpers.verifyUser as any).mockResolvedValue({
                success: true,
                data: { contractSigned: true }
            });

            Object.defineProperty(window, "location", {
                value: {
                    search: "?phase=2&userId=123&country=CZ",
                    replace: vi.fn(),
                    href: "http://localhost:3000",
                    origin: "http://localhost:3000",
                    hostname: "localhost"
                },
                writable: true,
            });

            render(App);

            await waitFor(() => expect(screen.getByText(/Poslední podrobnosti/i)).toBeInTheDocument());
        });

        it("should handle verification failure", async () => {
            (helpers.verifyUser as any).mockResolvedValue({
                success: true,
                data: { contractSigned: false }
            });

            Object.defineProperty(window, "location", {
                value: {
                    search: "?phase=2&userId=123&country=CZ",
                    replace: vi.fn(),
                    href: "http://localhost:3000",
                    origin: "http://localhost:3000",
                    hostname: "localhost"
                },
                writable: true,
            });

            render(App);

            await waitFor(() => {
                expect(screen.getByText(/omlouváme se/i)).toBeInTheDocument();
            });
        });

        it("should handle country variants correctly (CZ)", async () => {
            (helpers.verifyUser as any).mockResolvedValue({
                success: true,
                data: { contractSigned: true }
            });

            Object.defineProperty(window, "location", {
                value: {
                    search: "?phase=2&userId=123&country=CZ",
                    replace: vi.fn(),
                    href: "http://localhost:3000",
                    origin: "http://localhost:3000",
                    hostname: "localhost"
                },
                writable: true,
            });

            const { container } = render(App);

            // Using a specific text matcher function because 'občanský průkaz' might be split across elements or contain HTML
            await waitFor(() => {
                const found = screen.queryAllByText((content, element) => {
                    return content.includes('občanský průkaz') || content.includes('Občanský průkaz');
                });
                // Also check for name attribute if we added it
                const fileInput = container.querySelector('[name="filesNationalId"]');

                expect(found.length > 0 || fileInput).toBeTruthy();
            });
        });
    });
});
