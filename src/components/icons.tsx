type IconProps = { className?: string };

export function HomeIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M0 8.34051V16.6671C0 18.5058 1.49444 20 3.33333 20H16.6667C18.5056 20 20 18.5058 20 16.6671V8.34051L10 0L0 8.34051ZM18.3333 16.6671C18.3333 17.5864 17.5861 18.3336 16.6667 18.3336H3.33333C2.41389 18.3336 1.66667 17.5864 1.66667 16.6671V9.11818L10 2.16914L18.3333 9.11818V16.6671Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M16.669 8.33333C16.669 3.73889 12.9296 0 8.33449 0C3.73941 0 0 3.73889 0 8.33333C0 12.9278 3.73941 16.6667 8.33449 16.6667C10.332 16.6667 12.1684 15.9583 13.6047 14.7833L18.8221 20L20 18.8222L14.7826 13.6056C15.9606 12.1694 16.669 10.3333 16.669 8.33333ZM8.33449 15C4.65898 15 1.6669 12.0083 1.6669 8.33333C1.6669 4.65833 4.65898 1.66667 8.33449 1.66667C12.01 1.66667 15.0021 4.65833 15.0021 8.33333C15.0021 12.0083 12.01 15 8.33449 15Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TicketNavIcon({ className }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M16.3814 4.09536L17.0501 2.84319L14.7618 0.554814C14.0211 -0.185878 12.8182 -0.183982 12.0794 0.554816L0.554125 12.0801C-0.184672 12.8189 -0.184672 14.0237 0.554125 14.7625L2.86524 17.0736L3.93365 16.4674C4.96039 15.8839 6.2637 16.062 7.10101 16.8993C7.93831 17.7366 8.11449 19.038 7.53103 20.0648L6.92483 21.1332L9.23594 23.4443C9.97663 24.185 11.1814 24.185 11.9202 23.4462L23.4455 11.9209C24.1843 11.1821 24.1843 9.97732 23.4455 9.23853L21.1344 6.92742L20.066 7.53361C19.0392 8.11707 17.7359 7.939 16.8986 7.1017C16.0613 6.26439 15.8908 5.08232 16.3814 4.09536ZM20.8578 8.93164L22.3089 10.3751C22.4225 10.4888 22.4225 10.6707 22.3089 10.7843L10.7836 22.3096C10.67 22.4232 10.4881 22.4232 10.3744 22.3096L8.92716 20.8623L8.93095 20.8585C9.86866 19.2047 9.5845 17.1096 8.23762 15.7627C6.89073 14.4158 4.79369 14.1297 3.14181 15.0693L1.69074 13.6258C1.57708 13.5122 1.57708 13.3303 1.69074 13.2167L13.216 1.69143C13.3277 1.57966 13.5115 1.57776 13.6252 1.69143L15.0705 3.13682L14.9531 3.35656C14.1423 4.98192 14.4662 6.94257 15.7601 8.23641C17.0539 9.53026 19.2021 9.86745 20.8559 8.92975L20.8578 8.93164Z"
        fill="currentColor"
      />
      <path d="M10.1869 7.29682L9.0503 8.43343L10.4218 9.80494L11.5584 8.66833L10.1869 7.29682Z" fill="currentColor" />
      <path d="M12.7594 9.86935L11.6228 11.006L12.9943 12.3775L14.1309 11.2409L12.7594 9.86935Z" fill="currentColor" />
      <path d="M15.332 12.4419L14.1954 13.5785L15.5669 14.95L16.7035 13.8134L15.332 12.4419Z" fill="currentColor" />
    </svg>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10.9091 20H20V10.9091H10.9091V20ZM12.7273 12.7273H18.1818V18.1818H12.7273V12.7273Z" fill="currentColor" />
      <path d="M0 20H9.09091V10.9091H0V20ZM1.81818 12.7273H7.27273V18.1818H1.81818V12.7273Z" fill="currentColor" />
      <path d="M10.9091 9.09091H20V0H10.9091V9.09091ZM12.7273 1.81818H18.1818V7.27273H12.7273V1.81818Z" fill="currentColor" />
      <path d="M0 9.09091H9.09091V0H0V9.09091ZM1.81818 1.81818H7.27273V7.27273H1.81818V1.81818Z" fill="currentColor" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={className}>
      <path fillRule="evenodd" clipRule="evenodd" d="M5.625 4.375V2.5H4.375V5.625H6.875V4.375H5.625Z" fill="currentColor" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 0C2.23867 0 0 2.23867 0 5C0 7.76133 2.23867 10 5 10C7.76133 10 10 7.76133 10 5C10 2.23867 7.76133 0 5 0ZM5 8.75C2.9291 8.75 1.25 7.0709 1.25 5C1.25 2.9291 2.9291 1.25 5 1.25C7.0709 1.25 8.75 2.9291 8.75 5C8.75 7.0709 7.0709 8.75 5 8.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg width="10" height="13" viewBox="0 0 10 13" fill="none" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 0C2.2388 0 0 2.18283 0 4.875C0 7.56717 5 13 5 13C5 13 10 7.56717 10 4.875C10 2.18283 7.7612 0 5 0ZM5 8.125C3.15911 8.125 1.66667 6.66986 1.66667 4.875C1.66667 3.08014 3.15911 1.625 5 1.625C6.84089 1.625 8.33333 3.08014 8.33333 4.875C8.33333 6.66986 6.84089 8.125 5 8.125Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg width="16" height="15" viewBox="0 0 16 15" fill="none" className={className}>
      <path d="M6.98527 13.5L14.4853 6.00001L15.9853 7.50001L8.48527 15L6.98527 13.5Z" fill="currentColor" />
      <path d="M8.48527 1.93201e-05L15.9853 7.50001L14.4853 9.00001L6.98528 1.50002L8.48527 1.93201e-05Z" fill="currentColor" />
      <path d="M1.21532e-06 6.43934L14.8492 6.43934L14.8492 8.56066L8.44417e-07 8.56066L1.21532e-06 6.43934Z" fill="currentColor" />
    </svg>
  );
}

export function BackIcon({ className }: IconProps) {
  return (
    <svg width="16" height="15" viewBox="0 0 16 15" fill="none" className={className}>
      <path d="M8.99998 1.5L1.49998 9L-2.25814e-05 7.5L7.49998 -3.70903e-07L8.99998 1.5Z" fill="currentColor" />
      <path d="M7.49998 15L-2.25814e-05 7.5L1.49998 6L8.99998 13.5L7.49998 15Z" fill="currentColor" />
      <path d="M15.9853 8.56067L1.13601 8.56067L1.13601 6.43935L15.9853 6.43935L15.9853 8.56067Z" fill="currentColor" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className}>
      <path d="M10.5132 6.39169e-06L12 1.4868L1.59246 11.8943L0.105663 10.4075L10.5132 6.39169e-06Z" fill="currentColor" />
      <path d="M0 1.48679L1.48679 0L11.8943 10.4075L10.4075 11.8943L0 1.48679Z" fill="currentColor" />
    </svg>
  );
}

export function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg width="15" height="16" viewBox="0 0 15 16" fill="none" className={className}>
      <path d="M1.5 6.98529L9.00001 14.4853L7.50001 15.9853L0 8.48529L1.5 6.98529Z" fill="currentColor" />
      <path d="M15 8.48529L7.50001 15.9853L6 14.4853L13.5 6.98529L15 8.48529Z" fill="currentColor" />
      <path d="M8.56068 9.27259e-08V14.8493H6.43935L6.43935 0L8.56068 9.27259e-08Z" fill="currentColor" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg width="12" height="9" viewBox="0 0 12 9" fill="none" className={className}>
      <path d="M1.49999 2.99999L5.99998 7.49997L4.49998 8.99997L0 4.49998L1.49999 2.99999Z" fill="currentColor" />
      <path d="M12 1.49999L4.49998 8.99997L3.00003 7.49997L10.5 0L12 1.49999Z" fill="currentColor" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className}>
      <path d="M7 8.74227e-08L7 12H5L5 0L7 8.74227e-08Z" fill="currentColor" />
      <path d="M0 5H12V7H0V5Z" fill="currentColor" />
    </svg>
  );
}

export function MinusIcon({ className }: IconProps) {
  return (
    <svg width="12" height="2" viewBox="0 0 12 2" fill="none" className={className}>
      <path d="M0 0H12V2H0V0Z" fill="currentColor" />
    </svg>
  );
}

export function CartIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 5V4.5C6 2.567 7.567 1 9.5 1H10.5C12.433 1 14 2.567 14 4.5V5H17.5C17.9142 5 18.25 5.33579 18.25 5.75L17.5 17.5C17.4159 18.9007 16.2578 20 14.8547 20H5.14528C3.74224 20 2.58414 18.9007 2.5 17.5L1.75 5.75C1.75 5.33579 2.08579 5 2.5 5H6ZM9.5 2.66667C8.48896 2.66667 7.66667 3.48896 7.66667 4.5V5H12.3333V4.5C12.3333 3.48896 11.511 2.66667 10.5 2.66667H9.5ZM6 6.66667H3.4375L4.16116 17.4009C4.18926 17.8143 4.5329 18.1333 4.94722 18.1333H15.0528C15.4671 18.1333 15.8107 17.8143 15.8388 17.4009L16.5625 6.66667H14V8.33333C14 8.79357 13.6269 9.16667 13.1667 9.16667C12.7064 9.16667 12.3333 8.79357 12.3333 8.33333V6.66667H7.66667V8.33333C7.66667 8.79357 7.29357 9.16667 6.83333 9.16667C6.3731 9.16667 6 8.79357 6 8.33333V6.66667Z"
        fill="currentColor"
      />
    </svg>
  );
}
