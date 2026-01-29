from playwright.sync_api import sync_playwright, expect
import re

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        # Navigate to app
        page.goto("http://localhost:5174")

        # Bypass tutorial
        print("Bypassing tutorial...")
        page.evaluate("localStorage.setItem('hypersonic-tutorial-seen', 'true')")
        page.reload()

        # Wait for input text area
        print("Waiting for input...")
        page.wait_for_selector("textarea#input-text")

        # Type some text
        page.fill("textarea#input-text", "This is a test sentence for verifying Zen Mode accessibility.")

        # Click Start Reading
        print("Starting reading...")
        page.click("button:has-text('Start Reading')")

        # Wait for Control Panel to appear (Zen button)
        print("Locating Zen button...")
        zen_button = page.get_by_role("button", name="Toggle Zen Mode")
        expect(zen_button).to_be_visible()

        # Verify initial state (not pressed)
        print("Verifying initial state...")
        expect(zen_button).to_have_attribute("aria-pressed", "false")

        # Click Zen Mode
        print("Clicking Zen Mode...")
        zen_button.click()

        # Verify active state (pressed)
        print("Verifying active state...")
        expect(zen_button).to_have_attribute("aria-pressed", "true")

        # Verify visual change (blue background)
        # We look for the class 'bg-blue-600' which we added
        expect(zen_button).to_have_class(re.compile(r"bg-blue-600"))

        # Verify Summary button has popup attribute
        print("Verifying Summary button...")
        summary_button = page.get_by_role("button", name="Open AI Summary")
        expect(summary_button).to_have_attribute("aria-haspopup", "dialog")

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification/zen_mode_active.png")

        print("Verification successful!")
        browser.close()

if __name__ == "__main__":
    run()
