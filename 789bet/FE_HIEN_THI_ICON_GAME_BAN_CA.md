# Cách FE Hiển Thị Icon Game Bắn Cá

## Tổng Quan

Tài liệu này mô tả cách Frontend (FE) hiển thị icon của các game bắn cá trong ứng dụng 789BET.

## Luồng Dữ Liệu

```
API Response → Normalize → Component → Render Icon
```

### 1. API Trả Về Dữ Liệu

API có thể trả về icon game với các field khác nhau:
- `game_icon` (BC88BET format)
- `icon`
- `gameIconUrl` (789BET format)
- `image`

**Ví dụ API Response:**
```json
{
  "game_code": "FC001",
  "game_icon": "https://cdn.example.com/game-icon.png",
  "game_name": "Fishing Game"
}
```

### 2. Normalize Dữ Liệu

File: `src/utils/gameApiHelper.ts`

Hàm `normalizeGameObject()` chuẩn hóa các field khác nhau thành `gameIconUrl`:

```typescript
gameIconUrl: game.game_icon || game.icon || game.gameIconUrl || game.image
```

**Ưu tiên mapping:**
1. `game_icon` (BC88BET format)
2. `icon`
3. `gameIconUrl` (789BET format)
4. `image` (fallback)

**Code tham khảo:**
```typescript:142:142:src/utils/gameApiHelper.ts
    gameIconUrl: game.game_icon || game.icon || game.gameIconUrl || game.image,
```

### 3. Component Nhận Dữ Liệu

File: `src/app/games/FishGame/[gameName]/page.tsx`

- Fetch danh sách game từ API
- Normalize dữ liệu thành format chuẩn
- Truyền vào component `HotTheGame`

```typescript:344:349:src/app/games/FishGame/[gameName]/page.tsx
        {ListGame.length && (
          <HotTheGame
            listGame={ListGame}
            searchValue={propSearchValue}
            key="hotgame"
            gamename={gameName}
          />
        )}
```

## Component Hiển Thị

### Component `HotTheGame`

**File:** `src/components/HotTheGame/index.tsx`

**Chức năng:**
- Nhận `listGame` (mảng `IItemGame[]`)
- Phân trang (10 items/trang)
- Render từng game qua component `IntroItem`

**Code:**
```typescript:118:134:src/components/HotTheGame/index.tsx
      <div className=" pb-[20px] w-[850px] grid grid-cols-5 gap-[14px]">
        {gameSlider &&
          gameSlider.map((item, index) => {
            const isFavorite = favoriteGames?.some(
              (game) => game.game_id === String(item.gameId)
            );
            item.isFavorite = isFavorite;
            return (
              <IntroItem
                dataGame={item}
                titleSu={titleSu}
                key={index}
                gamename={gamename}
              />
            );
          })}
      </div>
```

**Layout:** Grid 5 cột (`grid-cols-5`)

### Component `IntroItem` - Hiển Thị Icon

**File:** `src/components/IntroducingTheGameSlotCasino/IntroItem.tsx`

**Chức năng:**
- Render icon game bằng thẻ `<img>`
- Xử lý hover effect
- Hiển thị tên game và nút favorite

**Code hiển thị icon:**
```typescript:102:110:src/components/IntroducingTheGameSlotCasino/IntroItem.tsx
        <img
          loading="lazy"
          className={`${
            isOpen && "opacity-70 bg-black"
          } transition duration-300 object-cover h-[140px]`}
          width={140}
          src={dataGame.gameIconUrl}
          alt=""
        />
```

**Đặc điểm:**
- **Kích thước:** `140px x 140px`
- **Lazy loading:** `loading="lazy"`
- **Hover effect:** Opacity giảm xuống 70% khi hover
- **CSS:** `object-cover` để giữ tỷ lệ khung hình
- **Transition:** `duration-300` cho animation mượt mà

### Component `FishGameItem` (Alternative)

**File:** `src/components/ListGameOptionsFish/FishGameItem.tsx`

Component này cũng được sử dụng để hiển thị icon game bắn cá:

```typescript:56:64:src/components/ListGameOptionsFish/FishGameItem.tsx
      <img
        loading="lazy"
        className={`${
          isOpen && "opacity-70 bg-black"
        } transition duration-300 object-cover h-[140px]`}
        width={140}
        src={dataGame.gameIconUrl}
        alt=""
      />
```

## Interface Dữ Liệu

**File:** `src/interface/game.interface.ts`

```typescript:1:27:src/interface/game.interface.ts
export interface IItemGame {
  gpId: any;
  gameId: number;
  gameType: number;
  gameTypeId: number;
  newGameType: number;
  rank: number;
  device: string;
  platform: string;
  provider: string;
  providerId: number;
  rtp: number;
  rows: number;
  reels: number;
  lines: number;
  blockCountries: string[];
  isMaintain: boolean;
  isEnabled: boolean;
  isProvideCommission: boolean;
  hasHedgeBet: boolean;
  gameName: string;
  gameIconUrl: string;  // ← Field chứa URL icon
  partnerName: string;
  providerName: string;
  createdAt: string;
  isFavorite: boolean;
}
```

**Field quan trọng:** `gameIconUrl: string` - Chứa URL của icon game

## Fallback Icon (Mobile)

**File:** `src/components/ItemGameMobile/index.tsx`

Trên mobile, có fallback icon nếu không có `gameIconUrl`:

```typescript:41:45:src/components/ItemGameMobile/index.tsx
      <img
        className="w-[74px] h-[74px] object-cover"
        src={item?.gameIconUrl ? item.gameIconUrl : 'https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/logo-games/dg-bcr.png'}
        alt=""
        onClick={handleClick}
      />
```

**Fallback URL:** `https://cdn.jsdelivr.net/gh/snail5555/akv@main/789bet/images/logo-games/dg-bcr.png`

## Tóm Tắt Quy Trình

1. **API Response:** API trả về game với field icon (có thể là `game_icon`, `icon`, v.v.)

2. **Normalize:** Hàm `normalizeGameObject()` trong `gameApiHelper.ts` chuẩn hóa tất cả thành `gameIconUrl`

3. **Component HotTheGame:** Nhận `listGame` (đã normalize), phân trang và map qua từng item

4. **Component IntroItem:** Render `<img src={dataGame.gameIconUrl} />` với:
   - Kích thước: 140x140px
   - Lazy loading
   - Hover effect (opacity)
   - CSS transitions

5. **Hiển Thị:** Icon được hiển thị trong grid 5 cột với spacing và styling phù hợp

## Các File Liên Quan

- `src/app/games/FishGame/[gameName]/page.tsx` - Page chính
- `src/components/HotTheGame/index.tsx` - Component container
- `src/components/IntroducingTheGameSlotCasino/IntroItem.tsx` - Component render icon
- `src/components/ListGameOptionsFish/FishGameItem.tsx` - Component alternative
- `src/utils/gameApiHelper.ts` - Normalize dữ liệu
- `src/interface/game.interface.ts` - Interface định nghĩa

## Lưu Ý

- Icon URL phải là URL hợp lệ (http/https)
- Nên sử dụng lazy loading để tối ưu performance
- Có fallback icon cho trường hợp không có icon
- Hover effect giúp UX tốt hơn
- Responsive: Mobile có kích thước icon nhỏ hơn (74x74px)

