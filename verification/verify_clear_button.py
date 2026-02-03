
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()

    # Set localStorage before navigation
    context.add_init_script("localStorage.setItem('hypersonic-tutorial-seen', 'true')")

    page = context.new_page()

    # Navigate to the app
    page.goto("http://localhost:5173")

    # Take a screenshot to see what's happening
    page.screenshot(path="verification/debug_state.png")
    print("Debug screenshot taken: verification/debug_state.png")

    # Wait for the input area
    input_area = page.locator("#input-text")
    expect(input_area).to_be_visible()

    # Type some text
    input_area.fill("Hello world, this is a test.")

    # Verify Clear button appears
    clear_button = page.get_by_role("button", name="Clear input")
    expect(clear_button).to_be_visible()

    # Verify word count
    word_count = page.get_by_text("6 words")
    expect(word_count).to_be_visible()

    # Take screenshot of the state with text
    page.screenshot(path="verification/1_with_text.png")
    print("Screenshot taken: verification/1_with_text.png")

    # Click Clear button
    clear_button.click()

    # Verify text is cleared
    expect(input_area).to_have_value("")

    # Verify Clear button is gone
    expect(clear_button).not_to_be_visible()

    # Take screenshot of the cleared state
    page.screenshot(path="verification/2_cleared.png")
    print("Screenshot taken: verification/2_cleared.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
