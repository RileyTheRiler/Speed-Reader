from playwright.sync_api import sync_playwright, expect

def verify_settings_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Navigate to app
        print("Navigating to app...")
        page.goto("http://localhost:5173")

        # Dismiss onboarding tutorial if it appears
        print("Dismissing tutorial...")
        page.evaluate("localStorage.setItem('hypersonic-tutorial-seen', 'true')")
        page.reload()

        # Enter text to enable reading mode
        print("Entering text...")
        # Wait for input to be visible
        page.wait_for_selector("#input-text")
        page.fill("#input-text", "This is some sample text for testing accessibility.")

        # Click Start Reading
        print("Clicking Start Reading...")
        page.click("text=Start Reading")

        # Open Settings Modal
        print("Opening settings...")
        page.get_by_label("Open settings").click()

        # Verify Modal is Open
        expect(page.get_by_text("Reader Settings")).to_be_visible()

        # Verify Reading Mode Radiogroup
        print("Verifying Reading Mode radiogroup...")
        reading_mode_group = page.get_by_role("radiogroup", name="Reading Mode")
        expect(reading_mode_group).to_be_visible()

        # Check RSVP button
        # Note: name might include nested text. "RSVP (Speed)"
        rsvp_button = reading_mode_group.get_by_role("radio", name="RSVP (Speed)")
        expect(rsvp_button).to_be_visible()
        # It should be checked by default (based on store initial state)
        expect(rsvp_button).to_be_checked()

        # Check Highlighter button
        highlighter_button = reading_mode_group.get_by_role("radio", name="Highlighter (Pacer)")
        expect(highlighter_button).to_be_visible()
        expect(highlighter_button).not_to_be_checked()

        # Verify Color Theme Radiogroup
        print("Verifying Color Theme radiogroup...")
        theme_group = page.get_by_role("radiogroup", name="Color Theme")
        expect(theme_group).to_be_visible()

        # Check Midnight theme (default)
        midnight_button = theme_group.get_by_role("radio", name="Select Midnight theme")
        expect(midnight_button).to_be_visible()
        expect(midnight_button).to_be_checked()

        # Take screenshot
        print("Taking screenshot...")
        page.screenshot(path="verification_settings_a11y.png")
        print("Verification successful! Screenshot saved to verification_settings_a11y.png")

        browser.close()

if __name__ == "__main__":
    verify_settings_accessibility()
