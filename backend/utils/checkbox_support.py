import random


def checkbox_random_count_by_weights(
    options, weights, expected_k: float = 2.0, min_sel=1
):
    # Tính alpha để E[K] = expected_k
    s = sum(weights)
    alpha = expected_k / s if s > 0 else 0.0

    selected = [
        opt for opt, w in zip(options, weights) if random.random() < min(1.0, alpha * w)
    ]

    # đảm bảo tối thiểu min_sel
    if len(selected) < min_sel:
        # chọn thêm theo trọng số còn lại
        remain = [opt for opt in options if opt not in selected]
        r_w = [weights[options.index(opt)] for opt in remain]
        if remain:
            # nếu tất cả weight = 0 → chọn đều
            if sum(r_w) == 0:
                r_w = [1] * len(remain)
            need = min_sel - len(selected)
            selected += random.choices(remain, weights=r_w, k=need)
            # loại trùng nếu lỡ trùng
            selected = list(dict.fromkeys(selected))
    return selected


if __name__ == "__main__":
    opts = ["A", "B", "C", "D"]
    wts = [5, 5, 2, 1]
    ans = checkbox_random_count_by_weights(opts, wts, expected_k=2, min_sel=1)
    print(ans)
