# Wallet Submission

### Wallet name

### Official wallet page

### Wallet icon

- [ ] I added the icon at `public/hodl/wallets/<wallet-id>/icon.<ext>`
- [ ] The icon is square and does not include a baked-in rounded square background

### Change type

- [ ] Add new wallet
- [ ] Update existing wallet

### Acceptance evidence

Provide official public links that help maintainers verify the wallet and decide whether it is mature enough to list.

Source repository, or reason source is not public:

Release page or app listing:

Documentation or support page:

Evidence of community usage or maturity:

Active maintenance evidence:

### Supported platforms

List every OS the wallet runs on. These map to the `platforms` field on the wallet record.

- [ ] Windows
- [ ] macOS
- [ ] Linux
- [ ] iOS
- [ ] Android
- [ ] Hardware

### User type

- [ ] New
- [ ] Experienced

### Criteria ratings and evidence

The wallet record carries a single `check` block that applies to every platform. Use the rating rubric in `docs/wallet-submissions.md`, and include evidence for each rating. Use `platformOverrides.<os>.check` only when one platform genuinely differs (rare).

| Criterion    | Proposed rating | Evidence |
| ------------ | --------------- | -------- |
| control      |                 |          |
| validation   |                 |          |
| transparency |                 |          |
| fees         |                 |          |

If any platform overrides one of these criteria, list it here:

### Features

The wallet record carries a single `features` array that applies to every platform. Use `platformOverrides.<os>.features` only when one platform genuinely differs.

2FA:

Hardware wallet support:

Multisig:

If any platform overrides the feature list, list it here:

### Acquisition actions

List every way a user can install or open the wallet. Each acquisition path is one entry in the wallet's `actions` array.

- An action without `platforms` applies to every platform the wallet supports.
- Use platform scopes when install, web, or source links differ by OS.
- App Store actions must be scoped `platforms: ["ios"]`. Google Play actions must be scoped `platforms: ["android"]`. Other actions can be scoped to any subset of `platforms` when the link genuinely differs per OS.

| Action      | Link | Platforms scope (omit if applies to all) |
| ----------- | ---- | ---------------------------------------- |
| app_store   |      | ios                                      |
| google_play |      | android                                  |
| download    |      |                                          |
| open        |      |                                          |
| view_source |      |                                          |

### Confirmation

- [ ] I added or updated only one wallet entry in `src/data/wallets.ts`
- [ ] `platforms` lists every supported OS
- [ ] `features` and `check` describe the wallet's defaults; per-OS variation lives in `platformOverrides`
- [ ] `actions` covers every acquisition path; platform-specific links use `platforms`
- [ ] Links point to official wallet pages
- [ ] I provided official links and evidence that maintainers can verify
- [ ] I ran `npm run wallets:check`
- [ ] I understand maintainers may ask for clarification, adjust unsupported claims, or decline the submission
