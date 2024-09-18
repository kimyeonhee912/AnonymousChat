# AnonymousChat

AnonymousChat은 사용자가 익명으로 메시지를 보내고 받을 수 있는 웹 애플리케이션입니다. React, JavaScript 및 Supabase를 사용하여 구축된 이 앱은 사용자가 자신의 정체를 드러내지 않고도 소통할 수 있는 간단하고 직관적인 인터페이스를 제공합니다.

## 업데이트 상황 (2024.09.18 업데이트)

- 기본적인 UI 구현 완료했습니다.
- 메시지 입력 및 메시지 목록에 대한 CSS 업데이트 완료했습니다.
- supabase 연결 성공: insert, read의 기능을 제공합니다.
- 날짜 버그 수정 완료했습니다.
- 다크모드를 지원합니다.
- 로드 지연(4초 이상)으로 인해 react-quary로 useInfiniteQuery 로 무한 스크롤 구현해볼 예정입니다.

## 기능

- **익명 메시지 전송**: 사용자는 가입이나 로그인 없이 메시지를 보낼 수 있습니다.
- **실시간 업데이트**: 메시지가 전송되면 실시간으로 화면에 표시됩니다. 
- **타임스탬프가 있는 메시지**: 각 메시지는 전송된 시간을 나타내는 타임스탬프와 함께 표시됩니다.


## 사용 기술

- **React**: 사용자 인터페이스 구축을 위한 라이브러리.
- **JavaScript**: 애플리케이션 로직 처리를 위한 언어.
- **Supabase**: 데이터베이스 관리 등 백엔드 서비스 제공.
- **SCSS**: 스타일을 작성하기 위한 CSS의 확장 언어.

## 설치

로컬에서 프로젝트를 실행하려면 다음 단계를 따르세요:

1. 레포지토리 클론:
   ```bash
   git clone https://github.com/yourusername/AnonymousChat.git
   ```
2. 프로젝트 디렉토리로 이동:
   ```bash
   cd AnonymousChat
   ```
4. 필요한 의존성 설치:
   ```bash
    npm install
   ```
6. 개발 서버 시작:
   ```bash
    npm run start
   ```

### 사용 방법

- 브라우저를 열고 http://localhost:3000으로 이동합니다.
- 입력 필드에 메시지를 입력합니다.
- "Enter"를 누르거나 "전송" 버튼을 클릭하여 메시지를 보냅니다.
- 아래에서 타임스탬프와 함께 메시지를 확인합니다.
