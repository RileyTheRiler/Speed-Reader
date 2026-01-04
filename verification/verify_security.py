from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:3000")

        # Wait for the textarea to be visible
        page.wait_for_selector("textarea")

        # Enter text
        text_input = "Hello World"
        page.fill("textarea", text_input)

        # Check if the character count is updated
        # The character count format is "11 / 100,000 characters"
        page.wait_for_selector("text=11 / 100,000 characters")

        # Take a screenshot
        page.screenshot(path="/app/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    verify_frontend()
