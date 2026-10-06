# Native frontend qualification: core 0.1.5 and themes 0.1.3

Started 2026-10-06. Source baseline: `683abf01e50d02ba18f2e177670ce55d9548e293`, tested product payload `935d472`. Existing disposable profile only. Core 0.1.5, Light/Dark 0.1.3. No new native hooks or automatic layout writes.

## Acceptance matrix

| Case | Acceptance | State |
|---|---|---|
| Light | Exact package installed; native synthetic rows, palette and reader controls readable | Pass on the tested build |
| Larger text | Three native font-size increases; palette input/filtering and sender/action controls reachable | Pass for native text scaling; extension text scaling not claimed |
| Narrow window | Native half-screen geometry, 960 x 1170 observed; palette keyboard filtering and navigation work, native actions wrap | Pass for tested width; popup image capture is cropped to the parent window |
| Pane focus | F6 reaches folder/list/reader; Up changes the synthetic folder selection; Escape dismisses palette | Pass; no unmodified J/K listener is enabled |
| Multiple windows | Navigate from both native mail windows; other window retains its folder | Pass in both directions |
| Restoration | Dark active; three font increases undone; extra window closed; original native window returned from tiling | Pass for theme/text/window cleanup; final geometry is 1920 x 1170, original 1280 x 870 capture not exactly restored |

## Decisions

Light is not installed in the disposable profile at the start. Install the exact existing local theme package for this qualification. Only synthetic local mail is inspected. Existing full automated suites and CI are retained because product code is unchanged; any product defect will receive targeted failing regression coverage before a fix.

## Results and limits

Installed Light SHA-256 is `74c05158f615397f9617bde9b0464833c39482c451651ced4af11ca8dd5a4af4`, matching the existing source/package record. Core and Dark hashes also remain identical. No product code changed. No actionable product defect was established in this pass.

The screenshot API crops popovers at the parent window boundary. Complete command text remains exposed in accessibility state and keyboard selection/Enter works. This is insufficient evidence of a native rendering defect or a complete visual accessibility pass. VoiceOver, IME, extension-page zoom, tighter widths and other Thunderbird builds remain unqualified.

Some accessibility clicks focused controls without activating them. One typing attempt therefore reached native mail shortcuts and navigated to the synthetic local POP Inbox, changing one synthetic fixture's read state. The test returned to the local navigation fixture before continuing. No real mail was opened or acted on and no mail was sent. Future automation must observe an actual palette before typing.

F01's native/public-API pilot is qualified for this scope. Reconstructed sidebar, preview lines and unmodified-key hooks remain absent. Next development slice is L01's supported-API identity/membership probe before implementing Gmail label controls.
