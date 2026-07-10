import os

from huggingface_hub import whoami


def main():
    token = os.getenv("HF_TOKEN")

    if not token:
        print("HF_TOKEN is not set.")
        return

    print(f"HF_TOKEN starts with hf_: {token.startswith('hf_')}")
    print(f"HF_TOKEN length: {len(token)}")

    try:
        user = whoami(token=token)
    except Exception as exc:
        print("Hugging Face rejected this token.")
        print(str(exc))
        return

    print("Hugging Face accepted this token.")
    print(f"Authenticated as: {user.get('name', 'unknown')}")


if __name__ == "__main__":
    main()
